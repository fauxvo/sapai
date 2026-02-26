import { EventEmitter } from 'events';
import type { PipelineStageRecord } from '@sapai/shared';

class RunEventBusClass extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  emitStageUpdate(runId: string, stage: PipelineStageRecord) {
    this.emit(`run:${runId}:stage`, stage);
  }

  emitRunComplete(runId: string) {
    this.emit(`run:${runId}:complete`);
  }

  onStageUpdate(runId: string, handler: (stage: PipelineStageRecord) => void) {
    this.on(`run:${runId}:stage`, handler);
    return () => this.off(`run:${runId}:stage`, handler);
  }

  onRunComplete(runId: string, handler: () => void) {
    this.once(`run:${runId}:complete`, handler);
    return () => this.off(`run:${runId}:complete`, handler);
  }

  cleanupRun(runId: string) {
    this.removeAllListeners(`run:${runId}:stage`);
    this.removeAllListeners(`run:${runId}:complete`);
  }
}

export const runEventBus = new RunEventBusClass();
