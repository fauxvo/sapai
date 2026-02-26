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

  return `You are an intent parser for SAP Purchase Order operations. Your ONLY job is to classify user messages into structured intents and extract field values.

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
