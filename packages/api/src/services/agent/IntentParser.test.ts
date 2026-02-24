import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ParsedIntent } from '@sapai/shared';

// Mock environment to prevent Zod validation of SAP env vars
vi.mock('../../config/environment.js', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test-key',
    ANTHROPIC_MODEL: 'claude-sonnet-4-5-20250514',
    AGENT_CONFIDENCE_THRESHOLD: 0.6,
  },
}));

// Mock the db module (transitive dependency via ConversationStore)
vi.mock('../../db/index.js', () => ({ db: null }));

import { IntentParser } from './IntentParser.js';
import { Validator } from './Validator.js';

function createMockClient(toolInput: Record<string, unknown>) {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            id: 'tool_123',
            name: 'parse_sap_intent',
            input: toolInput,
          },
        ],
        stop_reason: 'tool_use',
      }),
    },
  } as unknown as ConstructorParameters<typeof IntentParser>[0];
}

describe('IntentParser', () => {
  it('parses a single intent', async () => {
    const mockClient = createMockClient({
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.95,
          extractedFields: { poNumber: '4500000001' },
        },
      ],
    });

    const parser = new IntentParser(mockClient);
    const result = await parser.parse('Show me PO 4500000001');

    expect(result.intents).toHaveLength(1);
    expect(result.intents[0].intentId).toBe('GET_PURCHASE_ORDER');
    expect(result.intents[0].confidence).toBe(0.95);
    expect(result.intents[0].extractedFields.poNumber).toBe('4500000001');
  });

  it('parses multiple intents', async () => {
    const mockClient = createMockClient({
      intents: [
        {
          intentId: 'GET_PURCHASE_ORDER',
          confidence: 0.9,
          extractedFields: { poNumber: '4500000001' },
        },
        {
          intentId: 'UPDATE_PO_ITEM',
          confidence: 0.85,
          extractedFields: {
            poNumber: '4500000001',
            itemIdentifier: 'forks',
            quantity: 44,
          },
        },
      ],
    });

    const parser = new IntentParser(mockClient);
    const result = await parser.parse(
      'Check PO 4500000001 and change the forks quantity to 44',
    );

    expect(result.intents).toHaveLength(2);
    expect(result.intents[0].intentId).toBe('GET_PURCHASE_ORDER');
    expect(result.intents[1].intentId).toBe('UPDATE_PO_ITEM');
  });

  it('handles missing required fields', async () => {
    const mockClient = createMockClient({
      intents: [
        {
          intentId: 'UPDATE_PO_ITEM',
          confidence: 0.7,
          extractedFields: { poNumber: '4500000001' },
          missingRequiredFields: ['itemIdentifier'],
        },
      ],
    });

    const parser = new IntentParser(mockClient);
    const result = await parser.parse('Update something on PO 4500000001');

    expect(result.intents[0].missingRequiredFields).toContain('itemIdentifier');
  });

  it('handles unhandled content', async () => {
    const mockClient = createMockClient({
      intents: [],
      unhandledContent:
        'The user asked about the weather, which is not supported.',
    });

    const parser = new IntentParser(mockClient);
    const result = await parser.parse("What's the weather?");

    expect(result.intents).toHaveLength(0);
    expect(result.unhandledContent).toContain('not supported');
  });

  it('handles no tool_use in response', async () => {
    const mockClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Something went wrong' }],
          stop_reason: 'end_turn',
        }),
      },
    } as unknown as ConstructorParameters<typeof IntentParser>[0];

    const parser = new IntentParser(mockClient);
    const result = await parser.parse('test');

    expect(result.intents).toHaveLength(0);
    expect(result.unhandledContent).toBe('Failed to parse intent');
  });
});

describe('Validator', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  it('validates an intent with all required fields', () => {
    const intent: ParsedIntent = {
      intentId: 'GET_PURCHASE_ORDER',
      confidence: 0.9,
      extractedFields: { poNumber: '4500000001' },
    };

    const result = validator.validate(intent);
    expect(result.valid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('detects missing required fields', () => {
    const intent: ParsedIntent = {
      intentId: 'UPDATE_PO_ITEM',
      confidence: 0.9,
      extractedFields: { poNumber: '4500000001' },
    };

    const result = validator.validate(intent);
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('itemIdentifier');
  });

  it('merges LLM-flagged missing fields', () => {
    const intent: ParsedIntent = {
      intentId: 'GET_PURCHASE_ORDER',
      confidence: 0.8,
      extractedFields: {},
      missingRequiredFields: ['poNumber'],
    };

    const result = validator.validate(intent);
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('poNumber');
  });

  it('returns invalid for unknown intent ID', () => {
    const intent: ParsedIntent = {
      intentId: 'UNKNOWN_INTENT',
      confidence: 0.5,
      extractedFields: {},
    };

    const result = validator.validate(intent);
    expect(result.valid).toBe(false);
  });

  it('validates intents with no required fields', () => {
    const intent: ParsedIntent = {
      intentId: 'LIST_PURCHASE_ORDERS',
      confidence: 0.9,
      extractedFields: {},
    };

    const result = validator.validate(intent);
    expect(result.valid).toBe(true);
  });

  it('validates all intents in batch', () => {
    const results = validator.validateAll([
      {
        intentId: 'GET_PURCHASE_ORDER',
        confidence: 0.9,
        extractedFields: { poNumber: '4500000001' },
      },
      {
        intentId: 'UPDATE_PO_ITEM',
        confidence: 0.85,
        extractedFields: { poNumber: '4500000001' },
      },
    ]);

    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
  });
});
