import 'dotenv/config';
import { env } from './config/environment.js';
import { app } from './app.js';
import { runMigrations } from './db/migrate.js';
import { PipelineRunStore } from './services/agent/PipelineRunStore.js';

runMigrations();

// Crash recovery: mark any non-terminal runs as failed (server restarted)
(async () => {
  try {
    const pipelineStore = new PipelineRunStore();
    // Use 0ms cutoff — any non-terminal run at startup is stale
    const staleRuns = await pipelineStore.findStaleRuns(0);
    for (const run of staleRuns) {
      // Mark the run-level stage that was in-progress as failed too
      const runWithStages = await pipelineStore.getRunWithStages(run.id);
      if (runWithStages) {
        for (const stage of runWithStages.stages) {
          if (stage.status === 'running') {
            await pipelineStore.updateStage(stage.id, {
              status: 'failed',
              error: 'Server restarted during pipeline execution',
              completedAt: new Date().toISOString(),
            });
          }
        }
      }
      await pipelineStore.updateRun(run.id, {
        status: 'failed',
        error: 'Server restarted during pipeline execution',
        completedAt: new Date().toISOString(),
      });
    }
    if (staleRuns.length > 0) {
      console.log(`Recovered ${staleRuns.length} stale pipeline run(s)`);
    }
  } catch (err) {
    console.error(
      'Failed to recover stale runs:',
      err instanceof Error ? err.message : err,
    );
  }
})();

console.log(`SAP System: ${env.SAP_BASE_URL} (client ${env.SAP_CLIENT})`);
console.log(`Starting SAP Integration API on port ${env.PORT}`);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
