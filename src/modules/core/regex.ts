export interface IsRegexSupportedResult {
  isSupported: boolean;
  reason?: string | undefined;
}

export type RegexValidator = (
  regex: string,
  isCaseSensitive: boolean
) => Promise<IsRegexSupportedResult>;
