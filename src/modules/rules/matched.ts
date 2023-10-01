export interface RulePointer {
  ruleSetName: string;
  number: number;
  isBlocking: boolean;
}

export interface MatchedRule {
  ruleId: number;
  rule: RulePointer;
  timeStamp: number;
}
