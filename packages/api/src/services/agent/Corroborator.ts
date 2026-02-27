import type {
  ParsedIntent,
  ResolvedEntity,
  CorroborationResult,
  CorroborationSignal,
  CorroborationSignalResult,
  ResolutionConfidence,
} from '@sapai/shared';

// ---------------------------------------------------------------------------
// Signal Definition Registry
//
// Each signal is a self-contained rule that knows:
//   - what to extract from the user's parsed fields
//   - what to compare against in the SAP item metadata
//   - how to determine match/mismatch/partial
//
// To add a new corroboration rule, just add an entry to SIGNAL_DEFS.
// ---------------------------------------------------------------------------

interface SignalDef {
  id: string;
  label: string;
  weight: number;
  /** Extract a value from the user's parsed intent. Return null if unavailable.
   *  rawMessage is the original user text (for keyword extraction fallback). */
  extractUser: (intent: ParsedIntent, rawMessage?: string) => string | null;
  /** Extract the comparable value from SAP metadata. Return null if unavailable. */
  extractSap: (meta: Record<string, unknown>) => string | null;
  /** Compare user value to SAP value. Both are guaranteed non-null. */
  compare: (user: string, sap: string) => CorroborationSignalResult;
  /** Human explanation template. {user} and {sap} are substituted. */
  explanation: (user: string, sap: string, result: CorroborationSignalResult) => string;
}

// --- Comparison helpers ---

function numericEqual(a: string, b: string): boolean {
  const na = parseFloat(a.replace(/[^0-9.-]/g, ''));
  const nb = parseFloat(b.replace(/[^0-9.-]/g, ''));
  return !isNaN(na) && !isNaN(nb) && na === nb;
}

function substringMatch(needle: string, haystack: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

// Marker prefix for raw message fallback — used by the description signal
// to distinguish "user explicitly mentioned a description" (tiers 1-2) from
// "scanning the full raw message for any keyword overlap" (tier 3).
const RAW_MSG_PREFIX = '\x00RAW\x00';

function isRawFallback(s: string): boolean {
  return s.startsWith(RAW_MSG_PREFIX);
}

function stripRawPrefix(s: string): string {
  return isRawFallback(s) ? s.slice(RAW_MSG_PREFIX.length) : s;
}

// ---------------------------------------------------------------------------
// Signal Definitions
// ---------------------------------------------------------------------------

const SIGNAL_DEFS: SignalDef[] = [
  {
    id: 'quantity_match',
    label: 'Quantity',
    weight: 0.25,
    extractUser: (intent) => {
      // For update intents, extractedFields.quantity is the NEW target value.
      // We want the ORIGINAL quantity the user mentioned to validate the item.
      // e.g. "change from 49 to 75" → originalValue = "49", quantity = 75
      const fc = intent.fieldConfidence?.quantity;
      if (fc?.originalValue) return fc.originalValue;

      // For non-update intents (GET, CREATE), quantity IS the current value
      const isUpdate = intent.intentId.startsWith('UPDATE_');
      if (isUpdate) return null; // no original available — skip

      const qty =
        intent.extractedFields.quantity ??
        intent.extractedFields.newQuantity;
      return qty != null ? String(qty) : null;
    },
    extractSap: (meta) => {
      const qty = meta.quantity;
      const unit = meta.unit ?? '';
      return qty != null ? `${qty} ${unit}`.trim() : null;
    },
    compare: (user, sap) => (numericEqual(user, sap) ? 'match' : 'mismatch'),
    explanation: (user, sap, result) =>
      result === 'match'
        ? `User mentioned "${user}", SAP item quantity is ${sap}`
        : `User mentioned "${user}" but SAP item quantity is ${sap}`,
  },

  {
    id: 'description_match',
    label: 'Description',
    weight: 0.20,
    extractUser: (intent, rawMessage) => {
      // 1. Explicit description or material fields
      const desc = intent.extractedFields.description;
      if (desc) return String(desc);
      const material = intent.extractedFields.material;
      if (material) return String(material);

      // 2. Check itemIdentifier alternatives for description hints
      //    e.g. "Search by material description 'Brakes'" → extract "Brakes"
      const fc = intent.fieldConfidence?.itemIdentifier;
      if (fc?.alternatives) {
        for (const alt of fc.alternatives) {
          const m = alt.match(/description\s+'([^']+)'/i);
          if (m) return m[1];
        }
      }

      // 3. Fallback: use raw message so we can check SAP keywords against it
      //    This catches cases where the parser didn't explicitly extract
      //    description terms (e.g. "Brakes" mentioned but not captured).
      //    Marked with RAW_MSG_PREFIX so compare() knows this is tier-3:
      //    a match = positive evidence, but no-match = unavailable (NOT mismatch),
      //    because the user never explicitly claimed a description.
      if (rawMessage) return RAW_MSG_PREFIX + rawMessage;

      return null;
    },
    extractSap: (meta) => {
      const desc = meta.description ?? '';
      const material = meta.material ?? '';
      return `${desc} ${material}`.trim() || null;
    },
    compare: (user, sap) => {
      const rawFallback = isRawFallback(user);
      const userText = stripRawPrefix(user);

      // Extract meaningful keywords from SAP description (3+ chars, not pure numbers)
      const sapKeywords = sap
        .split(/[\s,;/()-]+/)
        .filter((w) => w.length >= 3 && !/^\d+$/.test(w))
        .map((w) => w.toLowerCase());
      if (sapKeywords.length === 0) return 'unavailable';

      const userLower = userText.toLowerCase();
      const matchedKeywords = sapKeywords.filter((kw) =>
        substringMatch(kw, userLower),
      );

      // At least one SAP description keyword found in user text → match
      if (matchedKeywords.length > 0) return 'match';

      // Explicit description (tiers 1-2) that doesn't match → mismatch (penalizes)
      // Raw message fallback (tier 3) with no overlap → unavailable (neutral)
      //   The user never explicitly described the item, so absence of SAP
      //   keywords in the email is not evidence of a wrong item.
      return rawFallback ? 'unavailable' : 'mismatch';
    },
    explanation: (user, sap, result) => {
      const userText = stripRawPrefix(user);
      const sapKeywords = sap
        .split(/[\s,;/()-]+/)
        .filter((w) => w.length >= 3 && !/^\d+$/.test(w));
      const userLower = userText.toLowerCase();
      const matched = sapKeywords.filter((kw) =>
        substringMatch(kw.toLowerCase(), userLower),
      );
      const matchStr =
        matched.length > 0 ? `"${matched.join('", "')}"` : 'keywords';

      if (result === 'match')
        return `${matchStr} from SAP description "${sap}" found in user message`;
      if (result === 'unavailable')
        return 'User did not mention an item description';
      return `User described "${userText}" but SAP description is "${sap}"`;
    },
  },

  {
    id: 'price_match',
    label: 'Price',
    weight: 0.15,
    extractUser: (intent) => {
      // For update intents, use originalValue (the current price) for validation
      const fc = intent.fieldConfidence?.netPrice;
      if (fc?.originalValue) return fc.originalValue;

      const isUpdate = intent.intentId.startsWith('UPDATE_');
      if (isUpdate) return null; // no original available — skip

      const price = intent.extractedFields.netPrice;
      return price != null ? String(price) : null;
    },
    extractSap: (meta) => {
      const price = meta.netPrice;
      const currency = meta.currency ?? '';
      return price != null && Number(price) !== 0
        ? `${price} ${currency}`.trim()
        : null;
    },
    compare: (user, sap) => numericEqual(user, sap) ? 'match' : 'mismatch',
    explanation: (user, sap, result) =>
      result === 'match'
        ? `User mentioned price "${user}", SAP item price is ${sap}`
        : `User mentioned price "${user}" but SAP item price is ${sap}`,
  },

  {
    id: 'plant_match',
    label: 'Plant',
    weight: 0.10,
    extractUser: (intent) => {
      const plant = intent.extractedFields.plant;
      return plant ? String(plant) : null;
    },
    extractSap: (meta) => {
      const plant = meta.plant;
      return plant ? String(plant) : null;
    },
    compare: (user, sap) =>
      user.trim().toLowerCase() === sap.trim().toLowerCase() ? 'match' : 'mismatch',
    explanation: (user, sap, result) =>
      result === 'match'
        ? `Plant "${user}" matches SAP plant ${sap}`
        : `Plant "${user}" does not match SAP plant ${sap}`,
  },

  {
    id: 'unit_match',
    label: 'Unit',
    weight: 0.10,
    extractUser: (intent) => {
      const unit = intent.extractedFields.unit
        ?? intent.extractedFields.purchaseOrderQuantityUnit;
      return unit ? String(unit) : null;
    },
    extractSap: (meta) => {
      const unit = meta.unit;
      return unit ? String(unit) : null;
    },
    compare: (user, sap) =>
      user.trim().toLowerCase() === sap.trim().toLowerCase() ? 'match' : 'mismatch',
    explanation: (user, sap, result) =>
      result === 'match'
        ? `Unit "${user}" matches SAP unit ${sap}`
        : `Unit "${user}" does not match SAP unit ${sap}`,
  },

  {
    id: 'delivery_date_match',
    label: 'Delivery Date',
    weight: 0.15,
    extractUser: (intent) => {
      // For update intents, use originalValue (the current date) for validation
      const fc = intent.fieldConfidence?.deliveryDate;
      if (fc?.originalValue) return fc.originalValue;

      const isUpdate = intent.intentId.startsWith('UPDATE_');
      if (isUpdate) return null; // no original available — skip

      const date = intent.extractedFields.deliveryDate;
      return date ? String(date) : null;
    },
    extractSap: (meta) => {
      const date = meta.deliveryDate;
      return date ? String(date) : null;
    },
    compare: (user, sap) => {
      // Normalize both to YYYY-MM-DD for comparison
      const normalize = (d: string) => {
        const parsed = new Date(d);
        if (isNaN(parsed.getTime())) return d.trim();
        return parsed.toISOString().slice(0, 10);
      };
      return normalize(user) === normalize(sap) ? 'match' : 'mismatch';
    },
    explanation: (user, sap, result) =>
      result === 'match'
        ? `Delivery date "${user}" matches SAP schedule line date ${sap}`
        : `Delivery date "${user}" does not match SAP schedule line date ${sap}`,
  },

  {
    id: 'quantity_unit_coherence',
    label: 'Qty/Unit Coherence',
    weight: 0.20,
    extractUser: (intent) => {
      // Look for dimensional unit mentions in the quantity rawValue
      // e.g. "Increase from 35 to 75ft" → "ft"
      const fc = intent.fieldConfidence?.quantity;
      if (!fc?.rawValue) return null;

      const unitPattern =
        /\b(ft|feet|foot|in|inch|inches|mm|cm|m|meters?|yd|yards?|kg|lbs?|oz|gal(?:lons?)?|liters?)\b/i;
      const match = fc.rawValue.match(unitPattern);
      if (match) return match[1].toLowerCase();

      // Also check for unit attached to number: "75ft", "20mm"
      const attached = fc.rawValue.match(
        /\d(ft|in|mm|cm|m|yd|kg|lb|oz)\b/i,
      );
      if (attached) return attached[1].toLowerCase();

      return null;
    },
    extractSap: (meta) => {
      const unit = meta.unit;
      return unit ? String(unit) : null;
    },
    compare: (user, sap) => {
      // Dimensional units that measure physical size/weight — not counts
      const dimensional = new Set([
        'ft', 'feet', 'foot',
        'in', 'inch', 'inches',
        'mm', 'cm', 'm', 'meter', 'meters',
        'yd', 'yard', 'yards',
        'kg', 'lb', 'lbs', 'oz',
        'gal', 'gallon', 'gallons',
        'liter', 'liters',
      ]);

      // SAP count units (quantity of discrete items)
      const countUnits = new Set([
        'ea', 'pc', 'pcs', 'st', 'each', 'piece', 'pieces', 'unit', 'units',
      ]);

      const sapLower = sap.trim().toLowerCase();

      // User mentioned a dimensional unit but SAP tracks discrete pieces
      // → likely a specification change, not a simple quantity change
      if (dimensional.has(user) && countUnits.has(sapLower)) {
        return 'mismatch';
      }

      // User's dimensional unit matches SAP unit → fine
      if (dimensional.has(user) && dimensional.has(sapLower)) {
        return 'match';
      }

      return 'match';
    },
    explanation: (user, sap, result) => {
      if (result === 'mismatch') {
        return (
          `User specified "${user}" but SAP item is measured in "${sap}" ` +
          `— this may indicate a product specification change (e.g. length) ` +
          `rather than a quantity change. Needs confirmation.`
        );
      }
      return `Unit "${user}" is compatible with SAP unit "${sap}"`;
    },
  },
];

// ---------------------------------------------------------------------------
// Confidence Conversion
// ---------------------------------------------------------------------------

function resolutionConfidenceToNumber(conf: ResolutionConfidence): number {
  switch (conf) {
    case 'exact': return 0.95;
    case 'high': return 0.80;
    case 'low': return 0.40;
    case 'ambiguous': return 0.30;
  }
}

// ---------------------------------------------------------------------------
// Core Corroboration Function
// ---------------------------------------------------------------------------

/**
 * Cross-reference a resolved SAP entity against the user's original parsed
 * intent to produce corroborating (or contradicting) evidence. Each registered
 * signal rule is evaluated independently. The result includes a confidence
 * score that reflects the combined evidence.
 *
 * To add new corroboration rules, add entries to SIGNAL_DEFS above.
 */
export function corroborate(
  intent: ParsedIntent,
  entity: ResolvedEntity,
  rawMessage?: string,
): CorroborationResult {
  const sapMeta = entity.metadata ?? {};
  const initialConfidence = resolutionConfidenceToNumber(entity.confidence);

  const signals: CorroborationSignal[] = [];
  let matchWeight = 0;
  let partialWeight = 0;
  let mismatchWeight = 0;
  let availableWeight = 0;

  for (const def of SIGNAL_DEFS) {
    const userVal = def.extractUser(intent, rawMessage);
    const sapVal = def.extractSap(sapMeta);

    // If either side is missing, signal is unavailable — skip it
    if (!userVal || !sapVal) {
      signals.push({
        id: def.id,
        label: def.label,
        userClaim: userVal ? stripRawPrefix(userVal) : '—',
        sapValue: sapVal ?? '—',
        result: 'unavailable',
        weight: def.weight,
        explanation: `Not enough data to evaluate ${def.label.toLowerCase()}`,
      });
      continue;
    }

    const result = def.compare(userVal, sapVal);
    const explanation = def.explanation(userVal, sapVal, result);

    signals.push({
      id: def.id,
      label: def.label,
      userClaim: stripRawPrefix(userVal),
      sapValue: sapVal,
      result,
      weight: def.weight,
      explanation,
    });

    if (result !== 'unavailable') {
      availableWeight += def.weight;
      if (result === 'match') matchWeight += def.weight;
      if (result === 'partial') partialWeight += def.weight;
      if (result === 'mismatch') mismatchWeight += def.weight;
    }
  }

  // Calculate corroborated confidence
  //
  // Matches BOOST confidence (close gap upward toward 100%):
  //   boost = (1 - initial) * matchRatio * 0.6
  //
  // Mismatches PENALIZE confidence (pull downward toward 0%):
  //   penalty = initial * mismatchRatio * 0.3
  //
  // The penalty factor (0.3) is less aggressive than the boost (0.6) so a
  // single mismatch doesn't catastrophically tank confidence, but it does
  // meaningfully flag that something needs investigation.
  //
  // Floor of 5% prevents confidence from ever reaching 0.
  let finalConfidence = initialConfidence;
  if (availableWeight > 0) {
    const matchRatio =
      (matchWeight + partialWeight * 0.5) / availableWeight;
    const mismatchRatio = mismatchWeight / availableWeight;

    const boost = (1 - initialConfidence) * matchRatio * 0.6;
    const penalty = initialConfidence * mismatchRatio * 0.3;

    finalConfidence = Math.max(0.05, initialConfidence + boost - penalty);
  }

  const availableSignals = signals.filter((s) => s.result !== 'unavailable');

  return {
    initialConfidence,
    finalConfidence,
    signals,
    matchCount: availableSignals.filter((s) => s.result === 'match').length,
    signalCount: availableSignals.length,
  };
}
