import { describe, expect, it, vi } from "vitest";
import { RegexValidator } from "@/modules/core/regex";
import {
  RequestMethod,
  ResourceType,
  RuleActionType,
} from "@/modules/core/rules";
import { ExportedRuleSets } from "@/modules/rules/export";
import { RULE_ID_UNSAVED, StoredRuleSets } from "@/modules/rules/stored";
import { performImportCommand } from "./import";

describe("performImportCommand", () => {
  const acceptAllRegex: RegexValidator = async () => ({ isSupported: true });

  it("should overwrite the rule set of the same name", async () => {
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
        id: "stored-1",
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
        id: "stored-2",
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

    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      storedRuleSets,
      acceptAllRegex
    );

    expect(valid).toBeTruthy();
    expect(errors).toStrictEqual([]);
    expect(ruleSets).toStrictEqual([
      {
        // replaced, keeping its ID
        id: "stored-1",
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
        id: "stored-2",
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
        // add, without an ID until the service saves it
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

  it("should keep every rule set of the same name in the file", async () => {
    const ruleSet = (name: string, domain: string) => ({
      name,
      rules: [
        {
          action: { type: RuleActionType.BLOCK },
          condition: { requestDomains: [domain] },
        },
      ],
    });
    const stored = (name: string, id: number, domain: string) => ({
      id: `rs-${id}`,
      name,
      rules: [{ id, ...ruleSet(name, domain).rules[0] }],
    });
    const unsaved = (name: string, domain: string, id?: string) => ({
      ...(id && { id }),
      name,
      rules: [{ id: RULE_ID_UNSAVED, ...ruleSet(name, domain).rules[0] }],
    });

    const target: ExportedRuleSets = {
      format: "BLOCKoli",
      version: 1,
      ruleSets: [
        ruleSet("a", "a1.example.com"),
        ruleSet("b", "b1.example.com"),
        ruleSet("a", "a2.example.com"),
        ruleSet("a", "a3.example.com"),
      ],
    };
    const storedRuleSets: StoredRuleSets = [
      stored("a", 1, "old-a1.example.com"),
      stored("c", 2, "old-c.example.com"),
      stored("a", 3, "old-a2.example.com"),
    ];

    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      storedRuleSets,
      acceptAllRegex
    );

    expect(valid).toBeTruthy();
    expect(errors).toStrictEqual([]);
    expect(ruleSets).toStrictEqual([
      unsaved("a", "a1.example.com", "rs-1"),
      stored("c", 2, "old-c.example.com"),
      unsaved("a", "a2.example.com", "rs-3"),
      unsaved("b", "b1.example.com"),
      unsaved("a", "a3.example.com"),
    ]);
  });

  it("accepts rule set IDs in the file but never uses them", async () => {
    const fileRuleSet = (id: string, name: string) => ({
      id,
      name,
      rules: [
        {
          action: { type: RuleActionType.BLOCK },
          condition: { requestDomains: ["example.com"] },
        },
      ],
    });
    const target: ExportedRuleSets = {
      format: "BLOCKoli",
      version: 1,
      ruleSets: [fileRuleSet("file-a", "a"), fileRuleSet("stored-b", "b")],
    };
    const storedRuleSets: StoredRuleSets = [
      { id: "stored-a", name: "a", rules: [] },
    ];

    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      storedRuleSets,
      acceptAllRegex
    );

    expect(valid).toBeTruthy();
    expect(errors).toStrictEqual([]);
    expect(ruleSets.map((ruleSet) => ruleSet.id)).toStrictEqual([
      "stored-a",
      undefined,
    ]);
  });

  // format error
  it.each([
    ["null", null],
    ["a number", 1],
    ["a string", "BLOCKoli"],
    ["an array", []],
  ])("should detect format error when the file holds %s", async (_, target) => {
    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      [],
      acceptAllRegex
    );

    expect(valid).toBeFalsy();
    expect(errors).toStrictEqual([
      {
        message:
          "The format is incorrect, please specify what was exported by BLOCKoli",
      },
    ]);
    expect(ruleSets).toStrictEqual([]);
  });

  it("should detect format error", async () => {
    const target = {
      // format: "BLOCKoli",
      version: 1,
      ruleSets: [],
    };

    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      [],
      acceptAllRegex
    );

    expect(valid).toBeFalsy();
    expect(errors).toStrictEqual([
      {
        message:
          "The format is incorrect, please specify what was exported by BLOCKoli",
      },
    ]);
    expect(ruleSets).toStrictEqual([]);
  });

  it("should detect unknown format version", async () => {
    const target = {
      format: "BLOCKoli",
      version: 0,
      ruleSets: [],
    };

    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      [],
      acceptAllRegex
    );

    expect(valid).toBeFalsy();
    expect(errors).toStrictEqual([
      {
        message: "The file format version is not supported",
      },
    ]);
    expect(ruleSets).toStrictEqual([]);
  });

  it("should detect validation errors", async () => {
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

    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      [],
      acceptAllRegex
    );

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

  it("should reject a regex that Chrome does not support", async () => {
    const target: ExportedRuleSets = {
      format: "BLOCKoli",
      version: 1,
      ruleSets: [
        {
          name: "ruleset #0",
          rules: [
            {
              action: { type: RuleActionType.BLOCK },
              condition: { urlFilter: "example", isRegexFilter: true },
            },
            {
              action: { type: RuleActionType.BLOCK },
              condition: { urlFilter: "foo(?=bar)", isRegexFilter: true },
            },
            {
              action: { type: RuleActionType.BLOCK },
              condition: { urlFilter: "foo(?=bar)" },
            },
          ],
        },
      ],
    };
    const regexValidator = vi.fn<RegexValidator>(async (regex) =>
      regex.includes("(?=")
        ? { isSupported: false, reason: "syntaxError" }
        : { isSupported: true }
    );
    const storedRuleSets: StoredRuleSets = [];

    const [valid, errors, ruleSets] = await performImportCommand(
      target,
      storedRuleSets,
      regexValidator
    );

    expect(valid).toBeFalsy();
    expect(errors).toStrictEqual([
      {
        message: "must use only regular expression syntax Chrome supports (no backreferences or lookarounds)",
        ruleField: "condition.urlFilter",
        ruleNumber: 1,
        ruleSetField: "rules",
        ruleSetNumber: 0,
      },
    ]);
    expect(ruleSets).toStrictEqual([]);
    expect(storedRuleSets).toStrictEqual([]);
    // Only regex filters are sent to Chrome
    expect(regexValidator.mock.calls).toStrictEqual([
      ["example", false],
      ["foo(?=bar)", false],
    ]);
  });
});
