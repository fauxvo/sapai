import type { ParsedIntent, ResolvedEntity } from '@sapai/shared';
import { intentMap } from './intents/registry.js';
import { PurchaseOrderService } from '../purchase-order/PurchaseOrderService.js';

export class EntityResolver {
  private poService: PurchaseOrderService;

  constructor(poService?: PurchaseOrderService) {
    this.poService = poService ?? new PurchaseOrderService();
  }

  async resolve(
    intent: ParsedIntent,
  ): Promise<{ intent: ParsedIntent; resolvedEntities: ResolvedEntity[] }> {
    const definition = intentMap.get(intent.intentId);
    if (!definition) {
      return { intent, resolvedEntities: [] };
    }

    const resolvedEntities: ResolvedEntity[] = [];
    const updatedFields = { ...intent.extractedFields };

    for (const field of [
      ...definition.requiredFields,
      ...definition.optionalFields,
    ]) {
      if (field.resolutionStrategy !== 'fuzzy_lookup') continue;

      const value = intent.extractedFields[field.name];
      if (value === undefined || value === null) continue;

      const poNumber = (intent.extractedFields.poNumber as string) ?? undefined;
      if (!poNumber) continue;

      const resolved = await this.resolvePOItem(poNumber, String(value));

      resolvedEntities.push(resolved);

      if (resolved.confidence === 'exact' || resolved.confidence === 'high') {
        updatedFields.itemId = resolved.resolvedValue;
      }
    }

    return {
      intent: { ...intent, extractedFields: updatedFields },
      resolvedEntities,
    };
  }

  async resolvePOItem(
    poNumber: string,
    itemIdentifier: string,
  ): Promise<ResolvedEntity> {
    // If it looks like an item number (digits, possibly with leading zeros), try exact match
    if (/^\d+$/.test(itemIdentifier)) {
      const padded = itemIdentifier.padStart(5, '0');
      return {
        originalValue: itemIdentifier,
        resolvedValue: padded,
        resolvedLabel: `Item ${padded}`,
        confidence: 'exact',
      };
    }

    // Fetch items from SAP and fuzzy match
    const result = await this.poService.getItems(poNumber);
    if (!result.success) {
      return {
        originalValue: itemIdentifier,
        resolvedValue: '',
        resolvedLabel: `Could not fetch items for PO ${poNumber}`,
        confidence: 'low',
      };
    }

    const items = result.data;
    const searchLower = itemIdentifier.toLowerCase();

    // Exact text match on item description or material
    const exactMatches = items.filter((item) => {
      const text = (item.purchaseOrderItemText ?? '').toLowerCase();
      const material = (item.material ?? '').toLowerCase();
      return text === searchLower || material === searchLower;
    });

    if (exactMatches.length === 1) {
      const item = exactMatches[0];
      return {
        originalValue: itemIdentifier,
        resolvedValue: item.purchaseOrderItem,
        resolvedLabel: `Item ${item.purchaseOrderItem} — ${item.purchaseOrderItemText ?? item.material}`,
        confidence: 'exact',
      };
    }

    // Substring match
    const substringMatches = items.filter((item) => {
      const text = (item.purchaseOrderItemText ?? '').toLowerCase();
      const material = (item.material ?? '').toLowerCase();
      return text.includes(searchLower) || material.includes(searchLower);
    });

    if (substringMatches.length === 1) {
      const item = substringMatches[0];
      return {
        originalValue: itemIdentifier,
        resolvedValue: item.purchaseOrderItem,
        resolvedLabel: `Item ${item.purchaseOrderItem} — ${item.purchaseOrderItemText ?? item.material}`,
        confidence: 'high',
      };
    }

    if (substringMatches.length > 1) {
      return {
        originalValue: itemIdentifier,
        resolvedValue: '',
        resolvedLabel: `Multiple items match "${itemIdentifier}"`,
        confidence: 'ambiguous',
        candidates: substringMatches.map((item) => ({
          originalValue: itemIdentifier,
          resolvedValue: item.purchaseOrderItem,
          resolvedLabel: `Item ${item.purchaseOrderItem} — ${item.purchaseOrderItemText ?? item.material}`,
          confidence: 'high' as const,
        })),
      };
    }

    return {
      originalValue: itemIdentifier,
      resolvedValue: '',
      resolvedLabel: `No items matching "${itemIdentifier}" found on PO ${poNumber}`,
      confidence: 'low',
    };
  }
}
