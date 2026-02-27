import type {
  ParsedIntent,
  ResolvedEntity,
  IntentDefinition,
  IntentCategory,
  POHeaderSummary,
  GuardSeverity,
  GuardViolation,
  RuleCheckResult,
  BusinessRulesResult,
} from '@sapai/shared';
import { intentMap } from './intents/registry.js';

// ---------------------------------------------------------------------------
// Rule Context — everything a rule needs to evaluate
// ---------------------------------------------------------------------------

export interface RuleContext {
  intent: ParsedIntent;
  resolvedEntities: ResolvedEntity[];
  definition: IntentDefinition;
  /** PO header summary from entity resolution (if available) */
  poHeader?: POHeaderSummary;
}

// ---------------------------------------------------------------------------
// Rule Definition
// ---------------------------------------------------------------------------

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  severity: GuardSeverity;
  /** Which intent categories this rule applies to. Use 'all' for universal rules. */
  appliesTo: IntentCategory[] | 'all';
  /** Return a violation if the rule is violated, or null if it passes. */
  evaluate(ctx: RuleContext): GuardViolation | GuardViolation[] | null;
}

// ---------------------------------------------------------------------------
// Helper: extract PO header from resolved entity metadata
// ---------------------------------------------------------------------------

function extractPOHeader(
  resolvedEntities: ResolvedEntity[],
): POHeaderSummary | undefined {
  // Accept any confidence level that carries metadata — safety rules
  // (deleted PO, released PO, currency change) must still fire even on
  // low-confidence POs to prevent accidental writes to the wrong order.
  const poEntity = resolvedEntities.find(
    (e) => e.entityType === 'purchaseOrder' && e.metadata,
  );
  if (!poEntity?.metadata) return undefined;
  const meta = poEntity.metadata as Record<string, unknown>;
  return meta.poHeader as POHeaderSummary | undefined;
}

// ---------------------------------------------------------------------------
// Helper: extract item metadata for a specific resolved item
// ---------------------------------------------------------------------------

function extractItemMeta(
  resolvedEntities: ResolvedEntity[],
): Record<string, unknown> | undefined {
  // Accept any confidence level that carries metadata — safety rules
  // (delivered, invoiced, deleted) must still fire even on low-confidence
  // items to prevent accidental data corruption.
  const itemEntity = resolvedEntities.find(
    (e) => e.entityType === 'purchaseOrderItem' && e.metadata,
  );
  return itemEntity?.metadata as Record<string, unknown> | undefined;
}

// ---------------------------------------------------------------------------
// Rule Definitions
// ---------------------------------------------------------------------------

const rules: BusinessRule[] = [
  // -----------------------------------------------------------------------
  // 1. NEGATIVE_QUANTITY — reject negative quantities on write operations
  // -----------------------------------------------------------------------
  {
    id: 'NEGATIVE_QUANTITY',
    name: 'Negative Quantity',
    description: 'Quantities must be non-negative',
    severity: 'block',
    appliesTo: ['create', 'update'],
    evaluate(ctx) {
      const qty = ctx.intent.extractedFields.quantity;
      if (qty === undefined || qty === null) return null;
      const num = Number(qty);
      if (isNaN(num)) return null;
      if (num < 0) {
        return {
          ruleId: 'NEGATIVE_QUANTITY',
          ruleName: 'Negative Quantity',
          severity: 'block',
          intentId: ctx.intent.intentId,
          field: 'quantity',
          message: `Quantity cannot be negative (${num}). SAP does not accept negative order quantities.`,
          currentValue: num,
          suggestedFix: `Use a positive quantity value. If you need to reduce stock, use a return order or goods receipt reversal.`,
        };
      }
      return null;
    },
  },

  // -----------------------------------------------------------------------
  // 2. ZERO_QUANTITY — warn on zero quantity (might be intentional)
  // -----------------------------------------------------------------------
  {
    id: 'ZERO_QUANTITY',
    name: 'Zero Quantity',
    description: 'Zero quantities may indicate an error',
    severity: 'warn',
    appliesTo: ['create', 'update'],
    evaluate(ctx) {
      const qty = ctx.intent.extractedFields.quantity;
      if (qty === undefined || qty === null) return null;
      const num = Number(qty);
      if (num === 0) {
        return {
          ruleId: 'ZERO_QUANTITY',
          ruleName: 'Zero Quantity',
          severity: 'warn',
          intentId: ctx.intent.intentId,
          field: 'quantity',
          message: `Quantity is set to 0. This will effectively cancel this line item.`,
          currentValue: 0,
          suggestedFix: `Verify that setting quantity to 0 is intentional. Consider deleting the item instead.`,
        };
      }
      return null;
    },
  },

  // -----------------------------------------------------------------------
  // 3. EXCESSIVE_QUANTITY — flag unreasonably large quantities
  // -----------------------------------------------------------------------
  {
    id: 'EXCESSIVE_QUANTITY',
    name: 'Excessive Quantity',
    description: 'Quantities above 999,999 are flagged as potentially erroneous',
    severity: 'warn',
    appliesTo: ['create', 'update'],
    evaluate(ctx) {
      const qty = ctx.intent.extractedFields.quantity;
      if (qty === undefined || qty === null) return null;
      const num = Number(qty);
      if (num > 999_999) {
        return {
          ruleId: 'EXCESSIVE_QUANTITY',
          ruleName: 'Excessive Quantity',
          severity: 'warn',
          intentId: ctx.intent.intentId,
          field: 'quantity',
          message: `Quantity ${num.toLocaleString()} is unusually large. Please verify this is correct.`,
          currentValue: num,
          suggestedFix: `Double-check the requested quantity. Common errors include extra zeros or confusing unit of measure.`,
        };
      }
      return null;
    },
  },

  // -----------------------------------------------------------------------
  // 4. QUANTITY_SPIKE — large percentage increase in quantity
  // -----------------------------------------------------------------------
  {
    id: 'QUANTITY_SPIKE',
    name: 'Quantity Spike',
    description:
      'Flag when new quantity is >500% of the current SAP quantity',
    severity: 'warn',
    appliesTo: ['update'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'UPDATE_PO_ITEM') return null;
      const newQty = Number(ctx.intent.extractedFields.quantity);
      if (!newQty || isNaN(newQty)) return null;

      const itemMeta = extractItemMeta(ctx.resolvedEntities);
      const currentQty = Number(itemMeta?.quantity ?? 0);
      if (currentQty <= 0) return null;

      const ratio = newQty / currentQty;
      if (ratio > 5) {
        return {
          ruleId: 'QUANTITY_SPIKE',
          ruleName: 'Quantity Spike',
          severity: 'warn',
          intentId: ctx.intent.intentId,
          field: 'quantity',
          message: `New quantity (${newQty}) is ${Math.round(ratio * 100)}% of current quantity (${currentQty}). This is a ${Math.round(ratio)}x increase.`,
          currentValue: newQty,
          sapValue: currentQty,
          suggestedFix: `Verify the intended quantity. A ${Math.round(ratio)}x increase may indicate a misunderstanding of the original quantity or units.`,
        };
      }
      return null;
    },
  },

  // -----------------------------------------------------------------------
  // 5. QUANTITY_CLIFF — large drop in quantity (>90%)
  // -----------------------------------------------------------------------
  {
    id: 'QUANTITY_CLIFF',
    name: 'Quantity Cliff',
    description:
      'Flag when new quantity drops by >90% from current SAP quantity',
    severity: 'warn',
    appliesTo: ['update'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'UPDATE_PO_ITEM') return null;
      const newQty = Number(ctx.intent.extractedFields.quantity);
      if (isNaN(newQty) || newQty <= 0) return null;

      const itemMeta = extractItemMeta(ctx.resolvedEntities);
      const currentQty = Number(itemMeta?.quantity ?? 0);
      if (currentQty <= 0) return null;

      const dropPct = ((currentQty - newQty) / currentQty) * 100;
      if (dropPct > 90) {
        return {
          ruleId: 'QUANTITY_CLIFF',
          ruleName: 'Quantity Cliff',
          severity: 'warn',
          intentId: ctx.intent.intentId,
          field: 'quantity',
          message: `New quantity (${newQty}) is ${dropPct.toFixed(0)}% lower than current quantity (${currentQty}).`,
          currentValue: newQty,
          sapValue: currentQty,
          suggestedFix: `Verify the intended quantity. If you want to reduce to near-zero, consider if this line item should be deleted instead.`,
        };
      }
      return null;
    },
  },

  // -----------------------------------------------------------------------
  // 6. PRICE_MODIFICATION_BLOCKED — block ALL price changes via natural language.
  //    Prices are negotiated contract terms and MUST NOT be modified through
  //    this system. This is a hard, non-negotiable rule. Defense-in-depth:
  //    the intent registry also omits netPrice from UPDATE_PO_ITEM, and the
  //    system prompt explicitly forbids it — this rule catches anything that
  //    slips through.
  // -----------------------------------------------------------------------
  {
    id: 'PRICE_MODIFICATION_BLOCKED',
    name: 'Price Modification Blocked',
    description:
      'Prices are contract terms — all price modifications via natural language are blocked',
    severity: 'block',
    appliesTo: ['update'],
    evaluate(ctx) {
      const price = ctx.intent.extractedFields.netPrice;
      if (price === undefined || price === null) return null;

      return {
        ruleId: 'PRICE_MODIFICATION_BLOCKED',
        ruleName: 'Price Modification Blocked',
        severity: 'block',
        intentId: ctx.intent.intentId,
        field: 'netPrice',
        message: `Price modifications are not allowed. Prices are negotiated contract terms and cannot be changed through this system. Attempted value: ${price}.`,
        currentValue: price,
        sapValue: extractItemMeta(ctx.resolvedEntities)?.netPrice,
        suggestedFix: `Price changes must be made directly in SAP by authorized procurement personnel.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 7. NEGATIVE_PRICE — block negative prices on new items
  // -----------------------------------------------------------------------
  {
    id: 'NEGATIVE_PRICE',
    name: 'Negative Price',
    description: 'Net price must be non-negative',
    severity: 'block',
    appliesTo: ['create'],
    evaluate(ctx) {
      // Check items array for CREATE_PURCHASE_ORDER
      if (ctx.intent.intentId === 'CREATE_PURCHASE_ORDER') {
        const items = ctx.intent.extractedFields.items;
        if (!Array.isArray(items)) return null;
        const violations: GuardViolation[] = [];
        for (let idx = 0; idx < items.length; idx++) {
          const item = items[idx] as Record<string, unknown>;
          const price = Number(item?.netPrice ?? 0);
          if (price < 0) {
            violations.push({
              ruleId: 'NEGATIVE_PRICE',
              ruleName: 'Negative Price',
              severity: 'block',
              intentId: ctx.intent.intentId,
              field: `items[${idx}].netPrice`,
              message: `Line item ${idx + 1} has a negative price (${price}). Prices must be non-negative.`,
              currentValue: price,
              suggestedFix: `Use a positive price value for line item ${idx + 1}.`,
            });
          }
        }
        return violations.length > 0 ? violations : null;
      }

      // Check netPrice for ADD_PO_ITEM
      if (ctx.intent.intentId === 'ADD_PO_ITEM') {
        const price = Number(ctx.intent.extractedFields.netPrice ?? 0);
        if (price < 0) {
          return {
            ruleId: 'NEGATIVE_PRICE',
            ruleName: 'Negative Price',
            severity: 'block',
            intentId: ctx.intent.intentId,
            field: 'netPrice',
            message: `Net price cannot be negative (${price}).`,
            currentValue: price,
            suggestedFix: `Use a positive price value.`,
          };
        }
      }
      return null;
    },
  },

  // -----------------------------------------------------------------------
  // 8. DELETED_PO_MODIFICATION — block write operations on deleted POs
  // -----------------------------------------------------------------------
  {
    id: 'DELETED_PO_MODIFICATION',
    name: 'Deleted PO Modification',
    description:
      'Cannot modify a purchase order that has been flagged for deletion',
    severity: 'block',
    appliesTo: ['update', 'create', 'delete'],
    evaluate(ctx) {
      // Only applies to intents that target an existing PO
      const poNumber = ctx.intent.extractedFields.poNumber;
      if (!poNumber) return null;

      const poHeader = ctx.poHeader;
      if (!poHeader?.isDeleted) return null;

      return {
        ruleId: 'DELETED_PO_MODIFICATION',
        ruleName: 'Deleted PO Modification',
        severity: 'block',
        intentId: ctx.intent.intentId,
        message: `PO ${poHeader.poNumber} is flagged for deletion. No modifications are allowed on deleted purchase orders.`,
        currentValue: poNumber,
        suggestedFix: `This PO has been deleted in SAP. If you need to work with these items, create a new purchase order.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 9. RELEASED_PO_MODIFICATION — warn when modifying POs with incomplete release
  // -----------------------------------------------------------------------
  {
    id: 'RELEASED_PO_WARNING',
    name: 'Release Status Warning',
    description:
      'Warns when modifying a PO that has an incomplete release (approval workflow in progress)',
    severity: 'warn',
    appliesTo: ['update', 'delete'],
    evaluate(ctx) {
      const poHeader = ctx.poHeader;
      if (!poHeader?.releaseNotCompleted) return null;

      return {
        ruleId: 'RELEASED_PO_WARNING',
        ruleName: 'Release Status Warning',
        severity: 'warn',
        intentId: ctx.intent.intentId,
        message: `PO ${poHeader.poNumber} has an incomplete release (approval workflow in progress). Modifications may reset the release status.`,
        currentValue: 'releaseNotCompleted=true',
        suggestedFix: `Be aware that modifying this PO may require it to go through the release/approval process again.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 10. LAST_ITEM_DELETE — warn when deleting the last item on a PO
  // -----------------------------------------------------------------------
  {
    id: 'LAST_ITEM_DELETE',
    name: 'Last Item Deletion',
    description: 'Warns when deleting the last remaining item on a PO',
    severity: 'warn',
    appliesTo: ['delete'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'DELETE_PO_ITEM') return null;
      const poHeader = ctx.poHeader;
      if (!poHeader) return null;

      if (poHeader.totalItems <= 1) {
        return {
          ruleId: 'LAST_ITEM_DELETE',
          ruleName: 'Last Item Deletion',
          severity: 'warn',
          intentId: ctx.intent.intentId,
          message: `PO ${poHeader.poNumber} only has ${poHeader.totalItems} item(s). Deleting this item will leave the PO empty.`,
          suggestedFix: `Consider deleting the entire PO instead, or verify that you want an empty purchase order.`,
        };
      }
      return null;
    },
  },

  // -----------------------------------------------------------------------
  // 11. SUPPLIER_CHANGE — flag supplier changes as high-risk
  // -----------------------------------------------------------------------
  {
    id: 'SUPPLIER_CHANGE',
    name: 'Supplier Change',
    description:
      'Changing the supplier on an existing PO is a high-risk operation',
    severity: 'warn',
    appliesTo: ['update'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'UPDATE_PO_HEADER') return null;
      const newSupplier = ctx.intent.extractedFields.supplier;
      if (!newSupplier) return null;

      const poHeader = ctx.poHeader;
      const currentSupplier = poHeader?.supplier;

      // No-op: supplier is not actually changing
      if (currentSupplier && currentSupplier === String(newSupplier))
        return null;

      return {
        ruleId: 'SUPPLIER_CHANGE',
        ruleName: 'Supplier Change',
        severity: 'warn',
        intentId: ctx.intent.intentId,
        field: 'supplier',
        message: `Changing the supplier${currentSupplier ? ` from ${currentSupplier}` : ''} to ${newSupplier} is a high-risk operation. This affects pricing, delivery terms, and contracts.`,
        currentValue: newSupplier,
        sapValue: currentSupplier,
        suggestedFix: `Verify supplier change is intentional. In many organizations, supplier changes require additional approvals.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 12. CURRENCY_CHANGE — block currency changes on existing POs
  // -----------------------------------------------------------------------
  {
    id: 'CURRENCY_CHANGE_BLOCKED',
    name: 'Currency Change Blocked',
    description:
      'Changing the document currency on an existing PO is blocked to prevent financial discrepancies',
    severity: 'block',
    appliesTo: ['update'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'UPDATE_PO_HEADER') return null;
      const newCurrency = ctx.intent.extractedFields.documentCurrency;
      if (!newCurrency) return null;

      const poHeader = ctx.poHeader;
      if (!poHeader) return null; // can't compare without resolved PO data
      if (poHeader.currency === newCurrency) return null; // same currency, no change

      return {
        ruleId: 'CURRENCY_CHANGE_BLOCKED',
        ruleName: 'Currency Change Blocked',
        severity: 'block',
        intentId: ctx.intent.intentId,
        field: 'documentCurrency',
        message: `Changing the document currency${poHeader ? ` from ${poHeader.currency}` : ''} to ${newCurrency} is not allowed. Currency changes on existing POs cause pricing and tax inconsistencies.`,
        currentValue: newCurrency,
        sapValue: poHeader?.currency,
        suggestedFix: `If a different currency is needed, create a new PO with the correct currency. Currency cannot be changed on existing purchase orders.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 13. DELETE_PO_SAFETY — extra confirmation info for PO deletion
  // -----------------------------------------------------------------------
  {
    id: 'DELETE_PO_SAFETY',
    name: 'PO Deletion Safety Check',
    description: 'Provides context on what a PO deletion affects',
    severity: 'info',
    appliesTo: ['delete'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'DELETE_PURCHASE_ORDER') return null;
      const poHeader = ctx.poHeader;

      const itemCount = poHeader?.totalItems ?? 0;
      return {
        ruleId: 'DELETE_PO_SAFETY',
        ruleName: 'PO Deletion Safety Check',
        severity: 'info',
        intentId: ctx.intent.intentId,
        message: `Deleting PO ${ctx.intent.extractedFields.poNumber} will soft-delete the order and all ${itemCount} line item(s). This sets the deletion indicator in SAP.`,
        currentValue: ctx.intent.extractedFields.poNumber,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 14. ITEMS_ARRAY_NEGATIVE_QUANTITY — check items array in CREATE_PO
  // -----------------------------------------------------------------------
  {
    id: 'ITEMS_NEGATIVE_QUANTITY',
    name: 'Negative Item Quantity',
    description: 'Check for negative quantities in items array',
    severity: 'block',
    appliesTo: ['create'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'CREATE_PURCHASE_ORDER') return null;
      const items = ctx.intent.extractedFields.items;
      if (!Array.isArray(items)) return null;

      const violations: GuardViolation[] = [];
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx] as Record<string, unknown>;
        const qty = Number(item?.quantity ?? 0);
        if (qty < 0) {
          violations.push({
            ruleId: 'ITEMS_NEGATIVE_QUANTITY',
            ruleName: 'Negative Item Quantity',
            severity: 'block',
            intentId: ctx.intent.intentId,
            field: `items[${idx}].quantity`,
            message: `Line item ${idx + 1} has a negative quantity (${qty}). All quantities must be non-negative.`,
            currentValue: qty,
            suggestedFix: `Correct the quantity for line item ${idx + 1} to a positive number.`,
          });
        }
      }
      return violations.length > 0 ? violations : null;
    },
  },

  // -----------------------------------------------------------------------
  // 15. DELIVERED_ITEM_MODIFICATION — block changes on fully delivered items
  //     SAP enforces this at the OData level too, but we provide better UX
  // -----------------------------------------------------------------------
  {
    id: 'DELIVERED_ITEM_MODIFICATION',
    name: 'Delivered Item Modification',
    description:
      'Blocks quantity changes on items marked as completely delivered',
    severity: 'block',
    appliesTo: ['update'],
    evaluate(ctx) {
      if (ctx.intent.intentId !== 'UPDATE_PO_ITEM') return null;
      const itemMeta = extractItemMeta(ctx.resolvedEntities);
      if (!itemMeta) return null;

      const isDelivered = itemMeta.isCompletelyDelivered === true;
      if (!isDelivered) return null;

      // Only block if they're trying to change quantity
      const qty = ctx.intent.extractedFields.quantity;
      if (qty === undefined || qty === null) return null;

      return {
        ruleId: 'DELIVERED_ITEM_MODIFICATION',
        ruleName: 'Delivered Item Modification',
        severity: 'block',
        intentId: ctx.intent.intentId,
        field: 'quantity',
        message: `This item has been marked as completely delivered. Quantity cannot be changed because goods receipt has been completed.`,
        currentValue: qty,
        sapValue: itemMeta.quantity,
        suggestedFix: `If you need to adjust quantities, contact your warehouse/receiving team to reverse the goods receipt first.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 16. INVOICED_ITEM_MODIFICATION — block all changes on finally invoiced items
  // -----------------------------------------------------------------------
  {
    id: 'INVOICED_ITEM_MODIFICATION',
    name: 'Invoiced Item Modification',
    description:
      'Blocks modifications on items that have been finally invoiced',
    severity: 'block',
    appliesTo: ['update', 'delete'],
    evaluate(ctx) {
      if (
        ctx.intent.intentId !== 'UPDATE_PO_ITEM' &&
        ctx.intent.intentId !== 'DELETE_PO_ITEM'
      )
        return null;
      const itemMeta = extractItemMeta(ctx.resolvedEntities);
      if (!itemMeta) return null;

      const isInvoiced = itemMeta.isFinallyInvoiced === true;
      if (!isInvoiced) return null;

      return {
        ruleId: 'INVOICED_ITEM_MODIFICATION',
        ruleName: 'Invoiced Item Modification',
        severity: 'block',
        intentId: ctx.intent.intentId,
        message: `This item has been finally invoiced. No modifications are allowed because the financial posting is complete.`,
        currentValue: ctx.intent.intentId === 'UPDATE_PO_ITEM' ? 'update' : 'delete',
        suggestedFix: `Financially closed items cannot be modified. If corrections are needed, use a credit memo or invoice reversal process in SAP.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 17. PAST_DELIVERY_DATE — reject delivery dates in the past
  // -----------------------------------------------------------------------
  {
    id: 'PAST_DELIVERY_DATE',
    name: 'Past Delivery Date',
    description: 'Delivery dates must not be in the past',
    severity: 'block',
    appliesTo: ['create', 'update'],
    evaluate(ctx) {
      const violations: GuardViolation[] = [];
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Helper to check a single date string
      const checkDate = (dateStr: string, field: string) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return; // skip invalid dates
        if (date.getTime() < today.getTime()) {
          violations.push({
            ruleId: 'PAST_DELIVERY_DATE',
            ruleName: 'Past Delivery Date',
            severity: 'block',
            intentId: ctx.intent.intentId,
            field,
            message: `Delivery date is in the past (${dateStr}).`,
            currentValue: dateStr,
            suggestedFix: `Set the delivery date to today or a future date.`,
          });
        }
      };

      if (ctx.intent.intentId === 'CREATE_PURCHASE_ORDER') {
        const items = ctx.intent.extractedFields.items;
        if (!Array.isArray(items)) return null;
        for (let idx = 0; idx < items.length; idx++) {
          const item = items[idx] as Record<string, unknown>;
          const dateStr = item?.deliveryDate as string | undefined;
          if (dateStr) checkDate(dateStr, `items[${idx}].deliveryDate`);
        }
      }

      if (
        ctx.intent.intentId === 'ADD_PO_ITEM' ||
        ctx.intent.intentId === 'UPDATE_PO_ITEM'
      ) {
        const dateStr = ctx.intent.extractedFields.deliveryDate as
          | string
          | undefined;
        if (dateStr) checkDate(dateStr, 'deliveryDate');
      }

      return violations.length > 0 ? violations : null;
    },
  },

  // -----------------------------------------------------------------------
  // 18. DELETED_ITEM_MODIFICATION — block changes on items flagged for deletion
  // -----------------------------------------------------------------------
  {
    id: 'DELETED_ITEM_MODIFICATION',
    name: 'Deleted Item Modification',
    description:
      'Blocks modifications on items that have been flagged for deletion',
    severity: 'block',
    appliesTo: ['update', 'delete'],
    evaluate(ctx) {
      if (
        ctx.intent.intentId !== 'UPDATE_PO_ITEM' &&
        ctx.intent.intentId !== 'DELETE_PO_ITEM'
      )
        return null;
      const itemMeta = extractItemMeta(ctx.resolvedEntities);
      if (!itemMeta) return null;

      // Check item-level deletion code
      const deletionCode = itemMeta.purchasingDocumentDeletionCode as
        | string
        | undefined;
      if (!deletionCode || deletionCode === '') return null;

      return {
        ruleId: 'DELETED_ITEM_MODIFICATION',
        ruleName: 'Deleted Item Modification',
        severity: 'block',
        intentId: ctx.intent.intentId,
        message: `This item has been flagged for deletion (code: ${deletionCode}). No modifications are allowed.`,
        suggestedFix: `If you need this item, ask an SAP administrator to remove the deletion flag first.`,
      };
    },
  },

  // -----------------------------------------------------------------------
  // 19. LOW_CONFIDENCE_ENTITY — warn when operating on entities resolved
  //     with non-exact confidence
  // -----------------------------------------------------------------------
  {
    id: 'LOW_CONFIDENCE_ENTITY',
    name: 'Low Confidence Entity',
    description:
      'Warns when a write operation targets an entity that was resolved with less-than-exact confidence',
    severity: 'warn',
    appliesTo: ['update', 'delete'],
    evaluate(ctx) {
      const violations: GuardViolation[] = [];
      for (const entity of ctx.resolvedEntities) {
        if (entity.entityType === 'purchaseOrder') continue; // PO itself is OK
        if (entity.confidence === 'exact') continue;
        if (entity.confidence === 'low') {
          violations.push({
            ruleId: 'LOW_CONFIDENCE_ENTITY',
            ruleName: 'Low Confidence Entity',
            severity: 'warn',
            intentId: ctx.intent.intentId,
            message: `Entity "${entity.originalValue}" was resolved with low confidence to "${entity.resolvedValue}". Operating on the wrong item could cause data corruption.`,
            currentValue: entity.originalValue,
            sapValue: entity.resolvedValue,
            suggestedFix: `Verify the item identity before proceeding. Use a more specific identifier (e.g., exact item number).`,
          });
        }
      }
      return violations.length > 0 ? violations : null;
    },
  },
];

// ---------------------------------------------------------------------------
// Business Rules Engine
// ---------------------------------------------------------------------------

export class BusinessRulesEngine {
  /**
   * Evaluate all business rules against a set of resolved intents.
   * Returns a result per intent, plus an aggregate result.
   */
  evaluate(
    resolvedIntents: Array<{
      intent: ParsedIntent;
      resolvedEntities: ResolvedEntity[];
    }>,
  ): BusinessRulesResult {
    const allViolations: GuardViolation[] = [];
    const allChecks: RuleCheckResult[] = [];
    let checksPerformed = 0;

    for (const { intent, resolvedEntities } of resolvedIntents) {
      const definition = intentMap.get(intent.intentId);
      if (!definition) continue;

      const poHeader = extractPOHeader(resolvedEntities);
      const ctx: RuleContext = {
        intent,
        resolvedEntities,
        definition,
        poHeader,
      };

      for (const rule of rules) {
        // Check if rule applies to this intent category
        if (
          rule.appliesTo !== 'all' &&
          !rule.appliesTo.includes(definition.category)
        ) {
          continue;
        }

        checksPerformed++;
        const result = rule.evaluate(ctx);
        if (result) {
          if (Array.isArray(result)) {
            allViolations.push(...result);
          } else {
            allViolations.push(result);
          }
          allChecks.push({
            ruleId: rule.id,
            ruleName: rule.name,
            description: rule.description,
            intentId: intent.intentId,
            passed: false,
            severity: rule.severity,
          });
        } else {
          allChecks.push({
            ruleId: rule.id,
            ruleName: rule.name,
            description: rule.description,
            intentId: intent.intentId,
            passed: true,
          });
        }
      }
    }

    const hasBlocking = allViolations.some((v) => v.severity === 'block');

    return {
      passed: !hasBlocking,
      violations: allViolations,
      checks: allChecks,
      checksPerformed,
      rulesPassed: allChecks.filter((c) => c.passed).length,
    };
  }
}
