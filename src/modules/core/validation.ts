import { Rule } from "./rules";

export interface ValidationResult {
  isValid: boolean;
  reason?: {
    isInvalidUrlFilter: boolean;
    urlFilterReason?: string;
  };
}

export type RuleValidator = (rule: Rule) => Promise<ValidationResult>;
