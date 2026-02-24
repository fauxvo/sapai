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
            required: ['intentId', 'confidence', 'extractedFields'],
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
