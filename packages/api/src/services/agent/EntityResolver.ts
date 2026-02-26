import type {
  ParsedIntent,
  ResolvedEntity,
  POHeaderSummary,
  POItemSummary,
} from '@sapai/shared';
import { intentMap } from './intents/registry.js';
import { PurchaseOrderService } from '../purchase-order/PurchaseOrderService.js';
import type { PurchaseOrder } from '../../generated/purchase-order-service/PurchaseOrder.js';
import type { PurchaseOrderItem } from '../../generated/purchase-order-service/PurchaseOrderItem.js';
import { sanitize } from '../../schemas/error.js';

// --- API Call Trace ---

export interface ApiCallTrace {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'CACHE';
  path: string;
  status: 'success' | 'miss' | 'error';
  detail: string;
  durationMs?: number;
}

// --- Levenshtein distance for fuzzy matching ---

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyScore(query: string, target: string): number {
  const dist = levenshtein(query.toLowerCase(), target.toLowerCase());
  const maxLen = Math.max(query.length, target.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

const FUZZY_THRESHOLD = 0.6;

// Helper to access `material` field on PurchaseOrderItem (declared but not in TS interface index)
function getMaterial(item: PurchaseOrderItem): string {
  return (
    ((item as unknown as Record<string, unknown>).material as string) ?? ''
  );
}

// --- Extract item number from natural language (e.g. "line 6" → "6") ---

const ITEM_NUMBER_PATTERNS = [
  /^line\s*(?:item)?\s*#?\s*(\d+)$/i, // "line 6", "line item 6", "line #6"
  /^item\s*#?\s*(\d+)$/i, // "item 6", "item #6"
  /^row\s*#?\s*(\d+)$/i, // "row 6"
  /^po\s*item\s*#?\s*(\d+)$/i, // "po item 6"
  /^#\s*(\d+)$/, // "#6"
];

function extractItemNumber(identifier: string): string | null {
  const trimmed = identifier.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  for (const pattern of ITEM_NUMBER_PATTERNS) {
    const m = trimmed.match(pattern);
    if (m) return m[1];
  }
  return null;
}

// --- Helpers to extract PO summary ---

function summarizePOHeader(
  po: PurchaseOrder,
  items: PurchaseOrderItem[],
): POHeaderSummary {
  const itemSummaries: POItemSummary[] = items.map((item) => ({
    itemNumber: item.purchaseOrderItem ?? '',
    description: item.purchaseOrderItemText ?? '',
    material: getMaterial(item),
    quantity: Number(item.orderQuantity ?? 0),
    unit: item.purchaseOrderQuantityUnit ?? '',
    netPrice: Number(item.netPriceAmount ?? 0),
    currency: item.documentCurrency ?? '',
    plant: item.plant ?? '',
  }));

  return {
    poNumber: po.purchaseOrder ?? '',
    supplier: po.supplier ?? '',
    companyCode: po.companyCode ?? '',
    orderType: po.purchaseOrderType ?? '',
    purchasingOrg: po.purchasingOrganization ?? '',
    purchasingGroup: po.purchasingGroup ?? '',
    currency: po.documentCurrency ?? '',
    paymentTerms: po.paymentTerms ?? '',
    createdBy: po.createdByUser ?? '',
    creationDate: po.creationDate
      ? new Date(po.creationDate as unknown as string)
          .toISOString()
          .slice(0, 10)
      : '',
    isDeleted: (po.purchasingDocumentDeletionCode ?? '') !== '',
    releaseNotCompleted: po.releaseIsNotCompleted ?? false,
    totalItems: items.length,
    items: itemSummaries,
  };
}

function formatPOLabel(summary: POHeaderSummary): string {
  const parts = [`PO ${summary.poNumber}`];
  if (summary.supplier) parts.push(`Supplier: ${summary.supplier}`);
  if (summary.companyCode) parts.push(`Company: ${summary.companyCode}`);
  parts.push(`${summary.totalItems} item(s)`);
  if (summary.isDeleted) parts.push('DELETED');
  return parts.join(' \u2014 ');
}

export class EntityResolver {
  private poService: PurchaseOrderService;

  constructor(poService?: PurchaseOrderService) {
    this.poService = poService ?? new PurchaseOrderService();
  }

  async resolve(
    intent: ParsedIntent,
    onTrace?: (trace: ApiCallTrace) => void | Promise<void>,
  ): Promise<{
    intent: ParsedIntent;
    resolvedEntities: ResolvedEntity[];
    traces: ApiCallTrace[];
  }> {
    const traces: ApiCallTrace[] = [];
    const trace = async (t: ApiCallTrace) => {
      traces.push(t);
      await onTrace?.(t);
    };

    const definition = intentMap.get(intent.intentId);
    if (!definition) {
      return { intent, resolvedEntities: [], traces };
    }

    const resolvedEntities: ResolvedEntity[] = [];
    const updatedFields = { ...intent.extractedFields };

    const poNumber = (intent.extractedFields.poNumber as string) ?? undefined;

    // --- Step 1: Validate PO existence and fetch header + items ---
    let poSummary: POHeaderSummary | null = null;
    let poItems: PurchaseOrderItem[] = [];

    if (poNumber) {
      const validation = await this.validatePO(poNumber, trace);
      resolvedEntities.push(validation.entity);

      if (validation.summary) {
        poSummary = validation.summary;
        poItems = validation.rawItems;
      }
    }

    // --- Step 2: Resolve fuzzy_lookup fields (item identifiers) ---
    for (const field of [
      ...definition.requiredFields,
      ...definition.optionalFields,
    ]) {
      if (field.resolutionStrategy !== 'fuzzy_lookup') continue;

      const value = intent.extractedFields[field.name];
      if (value === undefined || value === null) continue;
      if (!poNumber) continue;

      const resolved = poSummary
        ? await this.resolvePOItemFromCache(
            poNumber,
            String(value),
            poItems,
            trace,
          )
        : await this.resolvePOItemFromSAP(poNumber, String(value), trace);

      resolvedEntities.push(resolved);

      if (resolved.confidence === 'exact' || resolved.confidence === 'high') {
        updatedFields.itemId = resolved.resolvedValue;
      }
    }

    return {
      intent: { ...intent, extractedFields: updatedFields },
      resolvedEntities,
      traces,
    };
  }

  // --- PO Validation ---

  private async validatePO(
    poNumber: string,
    trace: (t: ApiCallTrace) => void | Promise<void> = () => {},
  ): Promise<{
    entity: ResolvedEntity;
    summary: POHeaderSummary | null;
    rawItems: PurchaseOrderItem[];
  }> {
    const start = Date.now();
    let result;
    try {
      result = await this.poService.getById(poNumber);
    } catch (err) {
      await trace({
        method: 'GET',
        path: `/sap/purchase-orders/${poNumber}`,
        status: 'error',
        detail: `Exception: ${err instanceof Error ? err.message : 'unknown'}`,
        durationMs: Date.now() - start,
      });
      return {
        entity: {
          originalValue: poNumber,
          resolvedValue: poNumber,
          resolvedLabel: `PO ${poNumber} — lookup failed: ${err instanceof Error ? err.message : 'unknown error'}`,
          confidence: 'low',
          matchType: 'po_lookup',
          entityType: 'purchaseOrder',
          metadata: { exists: false, error: String(err) },
        },
        summary: null,
        rawItems: [],
      };
    }

    if (!result.success) {
      await trace({
        method: 'GET',
        path: `/sap/purchase-orders/${poNumber}`,
        status: 'miss',
        detail: 'PO not found',
        durationMs: Date.now() - start,
      });
      return {
        entity: {
          originalValue: poNumber,
          resolvedValue: '',
          resolvedLabel: `PO ${poNumber} not found in SAP`,
          confidence: 'low',
          matchType: 'po_lookup',
          entityType: 'purchaseOrder',
          metadata: { exists: false, error: result.error },
        },
        summary: null,
        rawItems: [],
      };
    }

    const po = result.data;
    const rawItems: PurchaseOrderItem[] =
      (po.toPurchaseOrderItem as PurchaseOrderItem[]) ?? [];
    const summary = summarizePOHeader(po, rawItems);
    const elapsed = Date.now() - start;

    await trace({
      method: 'GET',
      path: `/sap/purchase-orders/${poNumber}`,
      status: 'success',
      detail: `${summary.totalItems} item(s), supplier ${summary.supplier}`,
      durationMs: elapsed,
    });

    return {
      entity: {
        originalValue: poNumber,
        resolvedValue: poNumber,
        resolvedLabel: formatPOLabel(summary),
        confidence: 'exact',
        matchType: 'po_lookup',
        entityType: 'purchaseOrder',
        metadata: { exists: true, poHeader: sanitize(summary) },
      },
      summary,
      rawItems,
    };
  }

  // --- PO Item Resolution (using cached items from PO fetch) ---

  private async resolvePOItemFromCache(
    poNumber: string,
    itemIdentifier: string,
    items: PurchaseOrderItem[],
    trace: (t: ApiCallTrace) => void | Promise<void> = () => {},
  ): Promise<ResolvedEntity> {
    // Extract item number from natural language ("line 6" → "6")
    const extracted = extractItemNumber(itemIdentifier);

    if (extracted) {
      const { match, strategy } = this.findNumericItem(extracted, items);

      // Trace the cache lookup attempts
      if (match) {
        await trace({
          method: 'CACHE',
          path: `/sap/purchase-orders/${poNumber}/items`,
          status: 'success',
          detail: `"${itemIdentifier}" → item ${match.purchaseOrderItem} via ${strategy}`,
        });
        const itemNum = match.purchaseOrderItem ?? extracted.padStart(5, '0');
        return {
          originalValue: itemIdentifier,
          resolvedValue: itemNum,
          resolvedLabel: `Item ${itemNum} \u2014 ${match.purchaseOrderItemText ?? getMaterial(match) ?? 'no description'}`,
          confidence: 'exact',
          matchType: 'numeric_pad',
          entityType: 'purchaseOrderItem',
          metadata: this.itemMetadata(match),
        };
      }

      await trace({
        method: 'CACHE',
        path: `/sap/purchase-orders/${poNumber}/items`,
        status: 'miss',
        detail: `"${itemIdentifier}" → tried padded (${extracted.padStart(5, '0')}), raw (${extracted}), positional (${String(parseInt(extracted, 10) * 10).padStart(5, '0')}) — no match in ${items.length} cached items`,
      });

      // Try direct API lookup as fallback (handles non-standard item numbering)
      const directResult = await this.directItemLookup(
        poNumber,
        extracted,
        itemIdentifier,
        trace,
      );
      if (directResult) return directResult;

      // Numeric but doesn't exist on this PO
      const padded = extracted.padStart(5, '0');
      return {
        originalValue: itemIdentifier,
        resolvedValue: padded,
        resolvedLabel: `Item ${padded} does not exist on PO ${poNumber}`,
        confidence: 'low',
        matchType: 'numeric_pad',
        entityType: 'purchaseOrderItem',
        metadata: {
          availableItems: items.map((i) => i.purchaseOrderItem),
        },
      };
    }

    await trace({
      method: 'CACHE',
      path: `/sap/purchase-orders/${poNumber}/items`,
      status: 'success',
      detail: `"${itemIdentifier}" → fuzzy text search across ${items.length} items`,
    });

    return this.fuzzyMatchItems(poNumber, itemIdentifier, items);
  }

  // --- PO Item Resolution (fallback: fetch from SAP) ---

  private async resolvePOItemFromSAP(
    poNumber: string,
    itemIdentifier: string,
    trace: (t: ApiCallTrace) => void | Promise<void> = () => {},
  ): Promise<ResolvedEntity> {
    const start = Date.now();
    const result = await this.poService.getItems(poNumber);
    if (!result.success) {
      await trace({
        method: 'GET',
        path: `/sap/purchase-orders/${poNumber}/items`,
        status: 'error',
        detail: 'Failed to fetch items',
        durationMs: Date.now() - start,
      });
      return {
        originalValue: itemIdentifier,
        resolvedValue: '',
        resolvedLabel: `Could not fetch items for PO ${poNumber}`,
        confidence: 'low',
        matchType: 'none',
        entityType: 'purchaseOrderItem',
      };
    }

    await trace({
      method: 'GET',
      path: `/sap/purchase-orders/${poNumber}/items`,
      status: 'success',
      detail: `Fetched ${result.data.length} items`,
      durationMs: Date.now() - start,
    });

    const extracted = extractItemNumber(itemIdentifier);

    if (extracted) {
      const { match, strategy } = this.findNumericItem(extracted, result.data);
      if (match) {
        await trace({
          method: 'CACHE',
          path: `/sap/purchase-orders/${poNumber}/items`,
          status: 'success',
          detail: `"${itemIdentifier}" → item ${match.purchaseOrderItem} via ${strategy}`,
        });
        const itemNum = match.purchaseOrderItem ?? extracted.padStart(5, '0');
        return {
          originalValue: itemIdentifier,
          resolvedValue: itemNum,
          resolvedLabel: `Item ${itemNum} \u2014 ${match.purchaseOrderItemText ?? getMaterial(match) ?? 'no description'}`,
          confidence: 'exact',
          matchType: 'numeric_pad',
          entityType: 'purchaseOrderItem',
          metadata: this.itemMetadata(match),
        };
      }

      // Try direct API lookup as fallback
      const directResult = await this.directItemLookup(
        poNumber,
        extracted,
        itemIdentifier,
        trace,
      );
      if (directResult) return directResult;

      const padded = extracted.padStart(5, '0');
      return {
        originalValue: itemIdentifier,
        resolvedValue: padded,
        resolvedLabel: `Item ${padded} does not exist on PO ${poNumber}`,
        confidence: 'low',
        matchType: 'numeric_pad',
        entityType: 'purchaseOrderItem',
      };
    }

    return this.fuzzyMatchItems(poNumber, itemIdentifier, result.data);
  }

  // --- Multi-strategy numeric item lookup against cached items ---

  private findNumericItem(
    extracted: string,
    items: PurchaseOrderItem[],
  ): { match: PurchaseOrderItem | undefined; strategy: string } {
    const padded = extracted.padStart(5, '0');
    const num = parseInt(extracted, 10);

    // Strategy 1: Padded match (e.g., "6" → "00006")
    const paddedMatch = items.find((i) => i.purchaseOrderItem === padded);
    if (paddedMatch) return { match: paddedMatch, strategy: 'padded' };

    // Strategy 2: Raw/unpadded match (e.g., "6" → "6")
    const rawMatch = items.find((i) => i.purchaseOrderItem === extracted);
    if (rawMatch) return { match: rawMatch, strategy: 'raw' };

    // Strategy 3: SAP standard positional (e.g., "6" → "00060", item 6 = 6×10)
    const sapPositional = String(num * 10).padStart(5, '0');
    const positionalMatch = items.find(
      (i) => i.purchaseOrderItem === sapPositional,
    );
    if (positionalMatch)
      return { match: positionalMatch, strategy: 'sap-positional' };

    // Strategy 4: Nth positional item (e.g., "line 6" → 6th item in list)
    if (num >= 1 && num <= items.length) {
      const nthItem = items[num - 1];
      if (nthItem) return { match: nthItem, strategy: 'nth-positional' };
    }

    return { match: undefined, strategy: 'none' };
  }

  // --- Direct API lookup for item by raw number ---

  private async directItemLookup(
    poNumber: string,
    rawNumber: string,
    originalValue: string,
    trace: (t: ApiCallTrace) => void | Promise<void> = () => {},
  ): Promise<ResolvedEntity | null> {
    // Try the direct getItem endpoint which handles SAP's own key resolution
    const start1 = Date.now();
    try {
      const result = await this.poService.getItem(poNumber, rawNumber);
      if (result.success) {
        const item = result.data;
        const itemNum = item.purchaseOrderItem ?? rawNumber;
        await trace({
          method: 'GET',
          path: `/sap/purchase-orders/${poNumber}/items/${rawNumber}`,
          status: 'success',
          detail: `Found: ${item.purchaseOrderItemText ?? getMaterial(item) ?? itemNum}`,
          durationMs: Date.now() - start1,
        });
        return {
          originalValue,
          resolvedValue: itemNum,
          resolvedLabel: `Item ${itemNum} \u2014 ${item.purchaseOrderItemText ?? getMaterial(item) ?? 'no description'}`,
          confidence: 'exact',
          matchType: 'numeric_pad',
          entityType: 'purchaseOrderItem',
          metadata: this.itemMetadata(item),
        };
      }
      await trace({
        method: 'GET',
        path: `/sap/purchase-orders/${poNumber}/items/${rawNumber}`,
        status: 'miss',
        detail: 'Item not found',
        durationMs: Date.now() - start1,
      });
    } catch {
      await trace({
        method: 'GET',
        path: `/sap/purchase-orders/${poNumber}/items/${rawNumber}`,
        status: 'error',
        detail: 'Request failed',
        durationMs: Date.now() - start1,
      });
    }

    // Also try padded version via direct API
    const padded = rawNumber.padStart(5, '0');
    if (padded !== rawNumber) {
      const start2 = Date.now();
      try {
        const result = await this.poService.getItem(poNumber, padded);
        if (result.success) {
          const item = result.data;
          const itemNum = item.purchaseOrderItem ?? padded;
          await trace({
            method: 'GET',
            path: `/sap/purchase-orders/${poNumber}/items/${padded}`,
            status: 'success',
            detail: `Found: ${item.purchaseOrderItemText ?? getMaterial(item) ?? itemNum}`,
            durationMs: Date.now() - start2,
          });
          return {
            originalValue,
            resolvedValue: itemNum,
            resolvedLabel: `Item ${itemNum} \u2014 ${item.purchaseOrderItemText ?? getMaterial(item) ?? 'no description'}`,
            confidence: 'exact',
            matchType: 'numeric_pad',
            entityType: 'purchaseOrderItem',
            metadata: this.itemMetadata(item),
          };
        }
        await trace({
          method: 'GET',
          path: `/sap/purchase-orders/${poNumber}/items/${padded}`,
          status: 'miss',
          detail: 'Item not found',
          durationMs: Date.now() - start2,
        });
      } catch {
        await trace({
          method: 'GET',
          path: `/sap/purchase-orders/${poNumber}/items/${padded}`,
          status: 'error',
          detail: 'Request failed',
          durationMs: Date.now() - start2,
        });
      }
    }

    return null;
  }

  // --- Multi-tier fuzzy matching ---

  private fuzzyMatchItems(
    poNumber: string,
    itemIdentifier: string,
    items: PurchaseOrderItem[],
  ): ResolvedEntity {
    const searchLower = itemIdentifier.toLowerCase();

    // Tier 1: Exact text match on description or material
    const exactMatches = items.filter((item) => {
      const text = (item.purchaseOrderItemText ?? '').toLowerCase();
      const material = getMaterial(item).toLowerCase();
      return text === searchLower || material === searchLower;
    });

    if (exactMatches.length === 1) {
      const item = exactMatches[0];
      return {
        originalValue: itemIdentifier,
        resolvedValue: item.purchaseOrderItem,
        resolvedLabel: `Item ${item.purchaseOrderItem} \u2014 ${item.purchaseOrderItemText ?? getMaterial(item)}`,
        confidence: 'exact',
        matchType: 'exact_text',
        entityType: 'purchaseOrderItem',
        metadata: this.itemMetadata(item),
      };
    }

    // Tier 2: Substring match
    const substringMatches = items.filter((item) => {
      const text = (item.purchaseOrderItemText ?? '').toLowerCase();
      const material = getMaterial(item).toLowerCase();
      return text.includes(searchLower) || material.includes(searchLower);
    });

    if (substringMatches.length === 1) {
      const item = substringMatches[0];
      return {
        originalValue: itemIdentifier,
        resolvedValue: item.purchaseOrderItem,
        resolvedLabel: `Item ${item.purchaseOrderItem} \u2014 ${item.purchaseOrderItemText ?? getMaterial(item)}`,
        confidence: 'high',
        matchType: 'substring',
        entityType: 'purchaseOrderItem',
        metadata: this.itemMetadata(item),
      };
    }

    if (substringMatches.length > 1) {
      return {
        originalValue: itemIdentifier,
        resolvedValue: '',
        resolvedLabel: `Multiple items match "${itemIdentifier}"`,
        confidence: 'ambiguous',
        matchType: 'substring',
        entityType: 'purchaseOrderItem',
        candidates: substringMatches.map((item) => ({
          originalValue: itemIdentifier,
          resolvedValue: item.purchaseOrderItem,
          resolvedLabel: `Item ${item.purchaseOrderItem} \u2014 ${item.purchaseOrderItemText ?? getMaterial(item)}`,
          confidence: 'high' as const,
          matchType: 'substring' as const,
          entityType: 'purchaseOrderItem' as const,
          metadata: this.itemMetadata(item),
        })),
      };
    }

    // Tier 3: Fuzzy (Levenshtein) matching
    const scored = items
      .map((item) => {
        const textScore = fuzzyScore(
          searchLower,
          (item.purchaseOrderItemText ?? '').toLowerCase(),
        );
        const materialScore = fuzzyScore(
          searchLower,
          getMaterial(item).toLowerCase(),
        );
        const bestScore = Math.max(textScore, materialScore);
        return { item, score: bestScore };
      })
      .filter((s) => s.score >= FUZZY_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 1) {
      const { item, score } = scored[0];
      return {
        originalValue: itemIdentifier,
        resolvedValue: item.purchaseOrderItem,
        resolvedLabel: `Item ${item.purchaseOrderItem} \u2014 ${item.purchaseOrderItemText ?? getMaterial(item)} (${Math.round(score * 100)}% match)`,
        confidence: 'high',
        matchType: 'fuzzy',
        entityType: 'purchaseOrderItem',
        metadata: {
          ...this.itemMetadata(item),
          fuzzyScore: score,
        },
      };
    }

    if (scored.length > 1) {
      return {
        originalValue: itemIdentifier,
        resolvedValue: '',
        resolvedLabel: `Multiple fuzzy matches for "${itemIdentifier}"`,
        confidence: 'ambiguous',
        matchType: 'fuzzy',
        entityType: 'purchaseOrderItem',
        candidates: scored.slice(0, 5).map(({ item, score }) => ({
          originalValue: itemIdentifier,
          resolvedValue: item.purchaseOrderItem,
          resolvedLabel: `Item ${item.purchaseOrderItem} \u2014 ${item.purchaseOrderItemText ?? getMaterial(item)} (${Math.round(score * 100)}% match)`,
          confidence: 'high' as const,
          matchType: 'fuzzy' as const,
          entityType: 'purchaseOrderItem' as const,
          metadata: {
            ...this.itemMetadata(item),
            fuzzyScore: score,
          },
        })),
      };
    }

    // No matches at all
    return {
      originalValue: itemIdentifier,
      resolvedValue: '',
      resolvedLabel: `No items matching "${itemIdentifier}" found on PO ${poNumber}`,
      confidence: 'low',
      matchType: 'none',
      entityType: 'purchaseOrderItem',
      metadata: {
        availableItems: items.map((i) => ({
          itemNumber: i.purchaseOrderItem,
          description: i.purchaseOrderItemText ?? '',
          material: getMaterial(i) ?? '',
        })),
      },
    };
  }

  // --- Helper to build item metadata ---

  private itemMetadata(item: PurchaseOrderItem): Record<string, unknown> {
    return {
      itemNumber: item.purchaseOrderItem,
      description: item.purchaseOrderItemText ?? '',
      material: getMaterial(item) ?? '',
      quantity: Number(item.orderQuantity ?? 0),
      unit: item.purchaseOrderQuantityUnit ?? '',
      netPrice: Number(item.netPriceAmount ?? 0),
      currency: item.documentCurrency ?? '',
      plant: item.plant ?? '',
    };
  }
}
