import type {
  ParsedIntent,
  ExecutionPlan,
  PlannedAction,
  ResolvedEntity,
} from '@sapai/shared';
import { intentMap } from './intents/registry.js';

export class PlanBuilder {
  build(
    intents: Array<{
      intent: ParsedIntent;
      resolvedEntities: ResolvedEntity[];
    }>,
  ): ExecutionPlan {
    const actions: PlannedAction[] = [];
    let requiresApproval = false;

    // Sort: reads first, then writes (per spec Section 7.2)
    const sorted = [...intents].sort((a, b) => {
      const catA = intentMap.get(a.intent.intentId)?.category ?? 'read';
      const catB = intentMap.get(b.intent.intentId)?.category ?? 'read';
      const order = { read: 0, create: 1, update: 2, delete: 3 };
      return (order[catA] ?? 0) - (order[catB] ?? 0);
    });

    for (const { intent, resolvedEntities } of sorted) {
      const definition = intentMap.get(intent.intentId);
      if (!definition) continue;

      // Determine if this action needs approval
      const needsApproval =
        definition.confirmation === 'always' ||
        (definition.confirmation === 'write_only' &&
          definition.category !== 'read');

      if (needsApproval) {
        requiresApproval = true;
      }

      // Build API call path with substitutions
      let path = definition.apiEndpoint.path;
      const fields = intent.extractedFields;

      for (const param of definition.apiEndpoint.pathParams) {
        const value = String(fields[param] ?? fields.itemId ?? '');
        path = path.replace(`{${param}}`, value);
      }

      // Build request body (non-path fields for write operations)
      let body: Record<string, unknown> | undefined;
      if (
        definition.apiEndpoint.method !== 'GET' &&
        definition.apiEndpoint.method !== 'DELETE'
      ) {
        body = {};
        for (const field of [
          ...definition.requiredFields,
          ...definition.optionalFields,
        ]) {
          if (
            definition.apiEndpoint.pathParams.includes(field.name) ||
            field.name === 'itemIdentifier'
          ) {
            continue;
          }
          if (fields[field.name] !== undefined) {
            body[field.name] = fields[field.name];
          }
        }
      }

      // Generate human-readable description
      const description = this.buildDescription(
        intent,
        resolvedEntities,
        definition.description,
      );

      // Assess risks
      const risks = this.assessRisks(intent, definition.category);

      actions.push({
        intentId: intent.intentId,
        description,
        apiCall: {
          method: definition.apiEndpoint.method,
          path,
          body,
        },
        resolvedEntities,
        risks,
      });
    }

    const planId = `plan_${crypto.randomUUID().slice(0, 8)}`;
    const summary = actions.map((a) => a.description).join('; ');

    return {
      planId,
      createdAt: new Date().toISOString(),
      intents: actions,
      requiresApproval,
      summary,
    };
  }

  private buildDescription(
    intent: ParsedIntent,
    resolvedEntities: ResolvedEntity[],
    fallback: string,
  ): string {
    const fields = intent.extractedFields;
    const poNumber = fields.poNumber ? `PO ${fields.poNumber}` : '';

    const resolvedLabels = resolvedEntities
      .filter((e) => e.confidence === 'exact' || e.confidence === 'high')
      .map((e) => e.resolvedLabel);

    switch (intent.intentId) {
      case 'GET_PURCHASE_ORDER':
        return `Retrieve ${poNumber}`;
      case 'LIST_PURCHASE_ORDERS':
        return 'List purchase orders';
      case 'GET_PO_ITEMS':
        return `List items on ${poNumber}`;
      case 'GET_PO_ITEM':
        return `Get ${resolvedLabels[0] ?? `item ${fields.itemIdentifier}`} on ${poNumber}`;
      case 'UPDATE_PO_ITEM': {
        const changes = [];
        if (fields.quantity !== undefined)
          changes.push(`quantity to ${fields.quantity}`);
        if (fields.netPrice !== undefined)
          changes.push(`price to ${fields.netPrice}`);
        if (fields.plant !== undefined)
          changes.push(`plant to ${fields.plant}`);
        const changeStr = changes.length > 0 ? changes.join(', ') : 'fields';
        const itemLabel = resolvedLabels[0] ?? `item ${fields.itemIdentifier}`;
        return `Update ${changeStr} on ${itemLabel} of ${poNumber}`;
      }
      case 'UPDATE_PO_HEADER': {
        const headerChanges = Object.keys(fields).filter(
          (k) => k !== 'poNumber',
        );
        return `Update ${headerChanges.join(', ')} on ${poNumber}`;
      }
      case 'CREATE_PURCHASE_ORDER':
        return `Create new purchase order`;
      case 'ADD_PO_ITEM':
        return `Add item to ${poNumber}`;
      case 'DELETE_PURCHASE_ORDER':
        return `Delete ${poNumber}`;
      case 'DELETE_PO_ITEM': {
        const itemLabel2 = resolvedLabels[0] ?? `item ${fields.itemIdentifier}`;
        return `Delete ${itemLabel2} from ${poNumber}`;
      }
      default:
        return fallback;
    }
  }

  private assessRisks(intent: ParsedIntent, category: string): string[] {
    const risks: string[] = [];

    if (category === 'delete') {
      risks.push('This is a destructive operation');
    }
    if (
      intent.intentId === 'CREATE_PURCHASE_ORDER' &&
      intent.extractedFields.items
    ) {
      risks.push('A new purchase order will be created in SAP');
    }

    return risks;
  }
}
