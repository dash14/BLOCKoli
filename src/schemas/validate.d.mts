type ValidationFunction = (obj: object) => boolean;

interface ValidationObject {
  errors?: { instancePath: string; message: string }[] | undefined;
}

export type SchemaValidator = ValidationFunction & ValidationObject;

export declare const Rule = SchemaValidator;

export declare const RuleSet = SchemaValidator;

export declare const RuleSets = SchemaValidator;
