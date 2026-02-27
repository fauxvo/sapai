import type { IntentDefinition } from '@sapai/shared';

export function buildSystemPrompt(registry: IntentDefinition[]): string {
  const intentDocs = registry
    .map((intent) => {
      const required = intent.requiredFields
        .map((f) => `  - ${f.name} (${f.type}, required): ${f.description}`)
        .join('\n');
      const optional = intent.optionalFields
        .map((f) => `  - ${f.name} (${f.type}, optional): ${f.description}`)
        .join('\n');
      const examples = intent.examples.map((e) => `  - "${e}"`).join('\n');

      return [
        `### ${intent.id}`,
        `${intent.description}`,
        `Category: ${intent.category}`,
        required ? `Required fields:\n${required}` : 'Required fields: none',
        optional ? `Optional fields:\n${optional}` : '',
        `Examples:\n${examples}`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `You are an intent parser for SAP Purchase Order operations. Your ONLY job is to classify user messages into structured intents and extract field values.

Today's date is ${today}.

## Rules
1. ONLY output intents from the supported list below. Never invent operations.
2. Extract field values exactly as the user states them. Do not guess or fabricate values.
3. If a field is ambiguous or you are not confident, include it in ambiguousFields.
4. If required fields are missing, list them in missingRequiredFields.
5. Support multiple intents in a single message.
6. Anything outside the supported intents goes in unhandledContent.
7. Confidence should reflect how clearly the user expressed the intent:
   - 0.9-1.0: Clear, unambiguous request with explicit values
   - 0.7-0.9: Likely intent but some inference required
   - 0.5-0.7: Possible intent but significant ambiguity
   - Below 0.5: Very uncertain, likely wrong
8. For EVERY extracted field, provide a per-field confidence score in fieldConfidence:
   - rawValue: The exact text the user wrote (e.g. "Line 6", "PO 4500000002")
   - confidence: 0.0-1.0 how confident you are in the extracted value
   - interpretation: A short explanation of how you interpreted it (e.g. "Explicit PO number", "Interpreted 'line 6' as item number 6")
   - alternatives: If the value is ambiguous, list other valid interpretations (e.g. for "line 6": ["Item number 00006", "6th positional line item (typically 00060 in SAP)"])

   Be especially careful with SAP item references:
   - "item 10" or "item number 10" → high confidence, direct item number
   - "line 6" or "6th item" → lower confidence, ambiguous between item number and positional index
   - SAP PO items are typically numbered in increments of 10 (00010, 00020, etc.), so "line 6" meaning item 00006 is unusual

9. For UPDATE intents: when the user mentions the current/original value of a field they want to change, capture it as originalValue in that field's fieldConfidence entry. This is critical for validating we found the right item.
   - "change the quantity from 49 to 75" → extractedFields.quantity = 75 (new value), fieldConfidence.quantity.originalValue = "49"
   - "the original 49 units... increase to 75" → same: quantity = 75, originalValue = "49"
   - "it currently costs $10, change to $15" → extractedFields.netPrice = 15, fieldConfidence.netPrice.originalValue = "10"
   - If the user only says "change quantity to 75" with no mention of the current value, omit originalValue

10. When the user mentions a material name, product description, or noun that identifies what an item IS (e.g. "brakes", "forks", "screws", "widgets"), capture it in the itemIdentifier's fieldConfidence alternatives as: "Search by material description '<keyword>'"
   - "the brakes on line 6" → alternatives should include "Search by material description 'Brakes'"
   - "update the forks item" → alternatives should include "Search by material description 'Forks'"
   - This helps downstream validation confirm the resolved item matches the user's description

11. For date fields (e.g. deliveryDate): when the user says a month and day without a year (e.g. "April 30th", "March 15"), ALWAYS assume the current year. Never default to a past year. Output dates in ISO format (YYYY-MM-DD).

12. PRICE CHANGES ARE FORBIDDEN. Never extract netPrice as a field to change on UPDATE_PO_ITEM. Prices are negotiated contract terms and cannot be modified through this system. If a user asks to change a price, put it in unhandledContent with a note that price changes are not permitted.

13. Messages may be EMAILS or forwarded correspondence — not just direct commands. Ignore greetings, small talk, signatures, and conversational filler. Focus ONLY on actionable SAP operations embedded in the message. A single email may contain multiple update requests (e.g. "Line 1: increase to 75, Line 3: decrease to 20" = two UPDATE_PO_ITEM intents). Extract ALL of them.

## Supported Intents

${intentDocs}

## Conversation Context
When prior messages are provided, use them to resolve references like "that PO", "the same order", "change it to", etc. The activeEntities object tells you which entities the user has been working with.`;
}

export function buildToolSchema(
  registry: IntentDefinition[],
): Record<string, unknown> {
  const intentIds = registry.map((i) => i.id);

  return {
    name: 'parse_sap_intent',
    description: 'Parse user message into structured SAP operation intent(s)',
    input_schema: {
      type: 'object',
      properties: {
        intents: {
          type: 'array',
          description: 'One or more intents detected in the message',
          items: {
            type: 'object',
            properties: {
              intentId: {
                type: 'string',
                enum: intentIds,
              },
              confidence: {
                type: 'number',
                description:
                  'Confidence 0.0-1.0 that this intent was correctly identified',
              },
              extractedFields: {
                type: 'object',
                description: 'Key-value pairs of extracted entity values',
                additionalProperties: true,
              },
              fieldConfidence: {
                type: 'object',
                description:
                  'Per-field confidence breakdown. Key is the field name, value is confidence details.',
                additionalProperties: {
                  type: 'object',
                  properties: {
                    confidence: {
                      type: 'number',
                      description:
                        'Confidence 0.0-1.0 that this specific field value is correct',
                    },
                    rawValue: {
                      type: 'string',
                      description:
                        'The exact text from the user message this was extracted from',
                    },
                    interpretation: {
                      type: 'string',
                      description:
                        'How you interpreted this value (e.g. "Explicit PO number", "Interpreted line 6 as item number 6")',
                    },
                    alternatives: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Other valid interpretations if ambiguous',
                    },
                    originalValue: {
                      type: 'string',
                      description:
                        'For update intents: the current/original value the user mentioned (e.g. "from 49 to 75" → originalValue is "49")',
                    },
                  },
                  required: ['confidence', 'rawValue', 'interpretation'],
                },
              },
              missingRequiredFields: {
                type: 'array',
                items: { type: 'string' },
                description: 'Required fields that could not be extracted',
              },
              ambiguousFields: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    value: { type: 'string' },
                    reason: { type: 'string' },
                  },
                  required: ['field', 'value', 'reason'],
                },
                description: 'Fields where the extracted value is uncertain',
              },
            },
            required: [
              'intentId',
              'confidence',
              'extractedFields',
              'fieldConfidence',
            ],
          },
        },
        unhandledContent: {
          type: 'string',
          description:
            'Parts of the message that do not map to any supported intent',
        },
      },
      required: ['intents'],
    },
  };
}
