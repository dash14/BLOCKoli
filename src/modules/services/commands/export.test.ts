import { describe, expect, it } from "vitest";
import {
  RequestMethod,
  ResourceType,
  RuleActionType,
} from "@/modules/core/rules";
import { ExportedRuleSets } from "@/modules/rules/export";
import { StoredRuleSets } from "@/modules/rules/stored";
import { performExportCommand } from "./export";

describe("performExportCommand", () => {
  it("should  be cleanup", () => {
    const storedRuleSets: StoredRuleSets = [
      {
        id: "rs-1",
        name: "ruleset #1",
        rules: [
          {
            id: 1,
            action: { type: RuleActionType.BLOCK },
            condition: {
              requestDomains: ["www.example.com"],
              initiatorDomains: [],
              urlFilter: "",
              isRegexFilter: true,
              requestMethods: [],
              resourceTypes: [],
            },
          },
          {
            id: 2,
            action: { type: RuleActionType.ALLOW },
            condition: {
              requestDomains: [],
              resourceTypes: [ResourceType.MAIN_FRAME],
            },
          },
        ],
      },
      {
        id: "rs-2",
        name: "ruleset #2",
        rules: [
          {
            id: 3,
            action: { type: RuleActionType.BLOCK },
            condition: {
              urlFilter: "/api/v1/login",
              isRegexFilter: false,
            },
          },
        ],
      },
    ];

    const actual = performExportCommand(storedRuleSets);

    const expected: ExportedRuleSets = {
      format: "BLOCKoli",
      version: 1,
      ruleSets: [
        {
          name: "ruleset #1",
          rules: [
            {
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: ["www.example.com"] },
            },
            {
              action: { type: RuleActionType.ALLOW },
              condition: { resourceTypes: [ResourceType.MAIN_FRAME] },
            },
          ],
        },
        {
          name: "ruleset #2",
          rules: [
            {
              action: { type: RuleActionType.BLOCK },
              condition: {
                urlFilter: "/api/v1/login",
                isRegexFilter: false,
              },
            },
          ],
        },
      ],
    };

    expect(actual).toStrictEqual(expected);
  });

  it("keeps non-empty domain and method lists", () => {
    const condition = {
      initiatorDomains: ["a.example"],
      requestDomains: ["b.example"],
      requestMethods: [RequestMethod.GET],
      resourceTypes: [ResourceType.SCRIPT],
    };
    const actual = performExportCommand([
      {
        id: "rs-3",
        name: "ruleset",
        rules: [{ id: 1, action: { type: RuleActionType.BLOCK }, condition }],
      },
    ]);

    expect(actual.ruleSets[0].rules[0].condition).toEqual(condition);
  });
});
