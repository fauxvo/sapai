import type { ParsedIntent } from '@sapai/shared';
import { intentMap } from './intents/registry.js';

export interface ValidationResult {
  valid: boolean;
  intent: ParsedIntent;
  missingFields: string[];
}

export class Validator {
  validate(intent: ParsedIntent): ValidationResult {
    const definition = intentMap.get(intent.intentId);

    if (!definition) {
      return {
        valid: false,
        intent,
        missingFields: [],
      };
    }

    const missingFields: string[] = [];

    for (const field of definition.requiredFields) {
      const value = intent.extractedFields[field.name];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field.name);
      }
    }

    // Also include any fields the LLM flagged as missing
    if (intent.missingRequiredFields) {
      for (const field of intent.missingRequiredFields) {
        if (!missingFields.includes(field)) {
          missingFields.push(field);
        }
      }
    }

    return {
      valid: missingFields.length === 0,
      intent,
      missingFields,
    };
  }

  validateAll(intents: ParsedIntent[]): ValidationResult[] {
    return intents.map((i) => this.validate(i));
  }
}
