import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { streamSSE } from 'hono/streaming';
import type { PipelineRunStatus } from '@sapai/shared';
import { getOrchestrator } from '../../services/agent/orchestrator-instance.js';
import {
  OrchestratorError,
  type OrchestratorErrorCode,
} from '../../services/agent/AgentOrchestrator.js';
import { PipelineRunStore } from '../../services/agent/PipelineRunStore.js';
import { runEventBus } from '../../services/agent/RunEventBus.js';
import { getAuth } from '../../middleware/auth.js';

const VALID_RUN_STATUSES = new Set<string>([
  'running',
  'completed',
  'failed',
  'awaiting_approval',
  'paused_at_parsing',
  'paused_at_validating',
  'paused_at_resolving',
  'paused_at_planning',
  'paused_at_executing',
]);

const MAX_LIST_LIMIT = 100;

function errorCodeToStatus(code: OrchestratorErrorCode): number {
  switch (code) {
    case 'CONVERSATION_ERROR':
      return 404;
    case 'EXECUTION_FAILED':
      return 409;
    default:
      return 500;
  }
}

function orchestratorErrorResponse(err: unknown) {
  if (err instanceof OrchestratorError) {
    return {
      status: errorCodeToStatus(err.code),
      body: {
        success: false as const,
        error: err.message,
        code: err.code,
      },
    };
  }
  return {
    status: 500,
    body: {
      success: false as const,
      error: err instanceof Error ? err.message : 'Unknown error',
    },
  };
}

const CreateRunBody = z.object({
  message: z.string().min(1),
  mode: z.enum(['auto', 'step']).default('auto'),
  conversationId: z.string().optional(),
});

export const runsApp = new OpenAPIHono();

const pipelineRunStore = new PipelineRunStore();

/** Return true if the authenticated user owns the run (or auth is disabled). */
function isOwner(
  run: { userId: string | null },
  auth: { userId: string } | undefined,
): boolean {
  // No userId on run (legacy/dev) or auth disabled → allow
  if (!run.userId || !auth) return true;
  return run.userId === auth.userId;
}

// POST /runs — Create and start a run
runsApp.post('/runs', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = CreateRunBody.safeParse(raw);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      },
      400,
    );
  }

  const body = parsed.data;
  const auth = getAuth(c);
  const orchestrator = getOrchestrator();

  try {
    const runWithStages = await orchestrator.startRun({
      message: body.message,
      mode: body.mode,
      conversationId: body.conversationId,
      userId: auth?.userId,
    });

    return c.json({ success: true, data: runWithStages }, 201);
  } catch (err) {
    const resp = orchestratorErrorResponse(err);
    return c.json(resp.body, resp.status as 404 | 409 | 500);
  }
});

// GET /runs — List runs
runsApp.get('/runs', async (c) => {
  const statusParam = c.req.query('status') || undefined;
  if (statusParam && !VALID_RUN_STATUSES.has(statusParam)) {
    return c.json(
      {
        success: false,
        error: `Invalid status filter: "${statusParam}". Valid values: ${[...VALID_RUN_STATUSES].join(', ')}`,
      },
      400,
    );
  }
  const limit = Math.min(
    Math.max(parseInt(c.req.query('limit') ?? '50', 10) || 50, 1),
    MAX_LIST_LIMIT,
  );
  const offset = Math.max(parseInt(c.req.query('offset') ?? '0', 10) || 0, 0);

  try {
    const runs = await pipelineRunStore.listRuns({
      status: statusParam as PipelineRunStatus | undefined,
      userId: getAuth(c)?.userId,
      limit,
      offset,
    });

    return c.json({ success: true, data: runs });
  } catch (err) {
    return c.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      500,
    );
  }
});

// GET /runs/:id — Get run with stages
runsApp.get('/runs/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const runWithStages = await pipelineRunStore.getRunWithStages(id);
    if (!runWithStages || !isOwner(runWithStages.run, getAuth(c))) {
      return c.json({ success: false, error: 'Run not found' }, 404);
    }

    return c.json({ success: true, data: runWithStages });
  } catch (err) {
    return c.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      500,
    );
  }
});

// POST /runs/:id/continue — Continue paused run
runsApp.post('/runs/:id/continue', async (c) => {
  const id = c.req.param('id');

  const existing = await pipelineRunStore.getById(id);
  if (!existing || !isOwner(existing, getAuth(c))) {
    return c.json({ success: false, error: 'Run not found' }, 404);
  }

  const orchestrator = getOrchestrator();

  try {
    const runWithStages = await orchestrator.continueRun({ runId: id });
    return c.json({ success: true, data: runWithStages });
  } catch (err) {
    const resp = orchestratorErrorResponse(err);
    return c.json(resp.body, resp.status as 404 | 409 | 500);
  }
});

// POST /runs/:id/approve — Approve pending plan
runsApp.post('/runs/:id/approve', async (c) => {
  const id = c.req.param('id');

  const existing = await pipelineRunStore.getById(id);
  if (!existing || !isOwner(existing, getAuth(c))) {
    return c.json({ success: false, error: 'Run not found' }, 404);
  }

  const orchestrator = getOrchestrator();

  try {
    const runWithStages = await orchestrator.approveRun(id, true);
    return c.json({ success: true, data: runWithStages });
  } catch (err) {
    const resp = orchestratorErrorResponse(err);
    return c.json(resp.body, resp.status as 404 | 409 | 500);
  }
});

// POST /runs/:id/reject — Reject pending plan
runsApp.post('/runs/:id/reject', async (c) => {
  const id = c.req.param('id');

  const existing = await pipelineRunStore.getById(id);
  if (!existing || !isOwner(existing, getAuth(c))) {
    return c.json({ success: false, error: 'Run not found' }, 404);
  }

  const orchestrator = getOrchestrator();

  try {
    const runWithStages = await orchestrator.approveRun(id, false);
    return c.json({ success: true, data: runWithStages });
  } catch (err) {
    const resp = orchestratorErrorResponse(err);
    return c.json(resp.body, resp.status as 404 | 409 | 500);
  }
});

// GET /runs/:id/stream — SSE stream for live updates
runsApp.get('/runs/:id/stream', async (c) => {
  const id = c.req.param('id');

  const runWithStages = await pipelineRunStore.getRunWithStages(id);
  if (!runWithStages || !isOwner(runWithStages.run, getAuth(c))) {
    return c.json({ success: false, error: 'Run not found' }, 404);
  }

  return streamSSE(c, async (stream) => {
    let eventId = 0;

    // Send initial snapshot
    await stream.writeSSE({
      id: String(eventId++),
      event: 'snapshot',
      data: JSON.stringify(runWithStages),
    });

    // If run is already complete, close immediately
    if (
      runWithStages.run.status === 'completed' ||
      runWithStages.run.status === 'failed'
    ) {
      await stream.writeSSE({
        id: String(eventId++),
        event: 'complete',
        data: JSON.stringify({ runId: id }),
      });
      return;
    }

    // Listen for stage updates
    let resolved = false;

    const unsubStage = runEventBus.onStageUpdate(id, async (stage) => {
      try {
        await stream.writeSSE({
          id: String(eventId++),
          event: 'stage',
          data: JSON.stringify(stage),
        });
      } catch {
        // Client disconnected
        resolved = true;
      }
    });

    const unsubComplete = runEventBus.onRunComplete(id, async () => {
      try {
        // Send final snapshot
        const finalRun = await pipelineRunStore.getRunWithStages(id);
        if (finalRun) {
          await stream.writeSSE({
            id: String(eventId++),
            event: 'snapshot',
            data: JSON.stringify(finalRun),
          });
        }
        await stream.writeSSE({
          id: String(eventId++),
          event: 'complete',
          data: JSON.stringify({ runId: id }),
        });
      } catch {
        // Client disconnected
      }
      resolved = true;
    });

    // Keep connection alive until run completes, client disconnects,
    // or max timeout (10 minutes) is reached
    const maxTimeout = Date.now() + 10 * 60 * 1000;
    while (!resolved && Date.now() < maxTimeout) {
      await new Promise((r) => setTimeout(r, 1000));

      // Check if stream is still writable
      try {
        await stream.writeSSE({
          id: String(eventId++),
          event: 'ping',
          data: '',
        });
      } catch {
        break;
      }
    }

    // Cleanup this connection's listeners only (not cleanupRun which
    // would nuke all listeners and break concurrent SSE clients)
    unsubStage();
    unsubComplete();
  });
});
