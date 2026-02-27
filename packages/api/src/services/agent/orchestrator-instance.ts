import { AgentOrchestrator } from './AgentOrchestrator.js';
import { ConversationStore } from './ConversationStore.js';
import { MessageDecomposer } from './MessageDecomposer.js';
import { IntentParser } from './IntentParser.js';
import { Validator } from './Validator.js';
import { EntityResolver } from './EntityResolver.js';
import { BusinessRulesEngine } from './BusinessRulesEngine.js';
import { PlanBuilder } from './PlanBuilder.js';
import { PlanStore } from './PlanStore.js';
import { Executor } from './Executor.js';
import { AuditLogger } from './AuditLogger.js';
import { PipelineRunStore } from './PipelineRunStore.js';
import { createLogger } from '../../utils/logger.js';

let _instance: AgentOrchestrator | undefined;

export function getOrchestrator(): AgentOrchestrator {
  if (!_instance) {
    const auditLogger = new AuditLogger();
    const pipelineRunStore = new PipelineRunStore();
    _instance = new AgentOrchestrator({
      conversationStore: new ConversationStore(),
      messageDecomposer: new MessageDecomposer(),
      intentParser: new IntentParser(),
      validator: new Validator(),
      entityResolver: new EntityResolver(),
      businessRulesEngine: new BusinessRulesEngine(),
      planBuilder: new PlanBuilder(),
      planStore: new PlanStore(),
      executor: new Executor(undefined, auditLogger),
      auditLogger,
      logger: createLogger('orchestrator'),
      pipelineRunStore,
    });
  }
  return _instance;
}
