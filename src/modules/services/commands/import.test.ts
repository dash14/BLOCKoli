import { describe, expect, it } from "vitest";
import {
  RequestMethod,
  ResourceType,
  RuleActionType,
} from "@/modules/core/rules";
import { ExportedRuleSets } from "@/modules/rules/export";
import { RULE_ID_UNSAVED, StoredRuleSets } from "@/modules/rules/stored";
import { performImportCommand } from "./import";

describe("performImportCommand", () => {
  it("should overwrite the rule set of the same name", () => {
    const target: ExportedRuleSets = {
      format: "BLOCKoli",
      version: 1,
      ruleSets: [
        {
          name: "ruleset #0",
          rules: [
            {
              action: { type: RuleActionType.BLOCK },
              condition: { resourceTypes: [ResourceType.MAIN_FRAME] },
            },
          ],
        },
        {
          name: "ruleset #1",
          rules: [
            {
              action: { type: RuleActionType.ALLOW },
              condition: { initiatorDomains: ["www.example.net"] },
            },
          ],
        },
      ],
    };

    const storedRuleSets: StoredRuleSets = [
      {
        name: "ruleset #1",
        rules: [
          {
            id: 1,
            action: {
              type: RuleActionType.BLOCK,
            },
            condition: {
              requestDomains: ["www.example.com"],
            },
          },
        ],
      },
      {
        name: "ruleset #2",
        rules: [
          {
            id: 2,
            action: { type: RuleActionType.BLOCK },
            condition: { requestMethods: [RequestMethod.GET] },
          },
        ],
      },
    ];

    const [valid, errors, ruleSets] = performImportCommand(
      target,
      storedRuleSets
    );

    expect(valid).toBeTruthy();
    expect(errors).toStrictEqual([]);
    expect(ruleSets).toStrictEqual([
      {
        // replaced
        name: "ruleset #1",
        rules: [
          {
            id: RULE_ID_UNSAVED,
            action: { type: RuleActionType.ALLOW },
            condition: { initiatorDomains: ["www.example.net"] },
          },
        ],
      },
      {
        // preserved
        name: "ruleset #2",
        rules: [
          {
            id: 2,
            action: { type: RuleActionType.BLOCK },
            condition: { requestMethods: [RequestMethod.GET] },
          },
        ],
      },
      {
        // add
        name: "ruleset #0",
        rules: [
          {
            id: RULE_ID_UNSAVED,
            action: { type: RuleActionType.BLOCK },
            condition: { resourceTypes: [ResourceType.MAIN_FRAME] },
          },
        ],
      },
    ]);
  });

  // format error
  it("should detect format error", () => {
    const target = {
      // format: "BLOCKoli",
      version: 1,
      ruleSets: [],
    };

    const [valid, errors, ruleSets] = performImportCommand(target, []);

    expect(valid).toBeFalsy();
    expect(errors).toStrictEqual([
      {
        message:
          "The format is incorrect, please specify what was exported by BLOCKoli",
      },
    ]);
    expect(ruleSets).toStrictEqual([]);
  });

  it("should detect unknown format version", () => {
    const target = {
      format: "BLOCKoli",
      version: 0,
      ruleSets: [],
    };

    const [valid, errors, ruleSets] = performImportCommand(target, []);

    expect(valid).toBeFalsy();
    expect(errors).toStrictEqual([
      {
        message: "The file format version is not supported",
      },
    ]);
    expect(ruleSets).toStrictEqual([]);
  });

  it("should detect validation errors", () => {
    const target = {
      format: "BLOCKoli",
      version: 1,
      ruleSets: [
        {
          name: "ruleset #1",
          rules: [],
        },
        {
          name: "ruleset #0",
          rules: [
            {
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: [] },
            },
          ],
        },
      ],
    };

    const [valid, errors, ruleSets] = performImportCommand(target, []);

    expect(valid).toBeFalsy();
    expect(errors).toStrictEqual([
      {
        message: "must NOT have fewer than 1 items",
        ruleSetField: "rules",
        ruleSetNumber: 0,
      },
      {
        message: "must contain at least one rule",
        ruleField: "condition",
        ruleNumber: 0,
        ruleSetField: "rules",
        ruleSetNumber: 1,
      },
    ]);
    expect(ruleSets).toStrictEqual([]);
  });
});
