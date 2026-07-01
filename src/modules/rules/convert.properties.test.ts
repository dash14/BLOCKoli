import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  REQUEST_METHODS,
  RESOURCE_TYPES,
  RuleActionType,
  type RequestMethod,
  type ResourceType,
} from "@/modules/core/rules";
import { convertToApiRule } from "./convert";
import type { StoredRule } from "./stored";

const actionTypeArb = fc.constantFrom(
  RuleActionType.BLOCK,
  RuleActionType.ALLOW
);

const requestMethodArb = fc.constantFrom(
  ...(REQUEST_METHODS as [RequestMethod, ...RequestMethod[]])
);

const resourceTypeArb = fc.constantFrom(
  ...(RESOURCE_TYPES as [ResourceType, ...ResourceType[]])
);

const domainArb = fc.domain();

const storedRuleArb: fc.Arbitrary<StoredRule> = fc.record({
  id: fc.integer({ min: 1 }),
  action: fc.record({ type: actionTypeArb }),
  condition: fc.record(
    {
      requestDomains: fc.option(fc.array(domainArb), { nil: undefined }),
      initiatorDomains: fc.option(fc.array(domainArb), { nil: undefined }),
      urlFilter: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
      isRegexFilter: fc.option(fc.boolean(), { nil: undefined }),
      requestMethods: fc.option(fc.array(requestMethodArb), { nil: undefined }),
      resourceTypes: fc.option(fc.array(resourceTypeArb), { nil: undefined }),
    },
    { requiredKeys: [] }
  ),
});

describe("convertToApiRule (property-based)", () => {
  it("preserves the number of rules", () => {
    fc.assert(
      fc.property(fc.array(storedRuleArb), (rules) => {
        expect(convertToApiRule(rules)).toHaveLength(rules.length);
      })
    );
  });

  it("resourceTypes is always defined and non-empty", () => {
    fc.assert(
      fc.property(fc.array(storedRuleArb), (rules) => {
        const result = convertToApiRule(rules);
        for (const apiRule of result) {
          expect(apiRule.condition.resourceTypes).toBeDefined();
          expect(apiRule.condition.resourceTypes!.length).toBeGreaterThan(0);
        }
      })
    );
  });

  it("empty or undefined resourceTypes is expanded to all RESOURCE_TYPES", () => {
    fc.assert(
      fc.property(
        fc.array(
          storedRuleArb.map((rule) => ({
            ...rule,
            condition: { ...rule.condition, resourceTypes: undefined },
          }))
        ),
        (rules) => {
          const result = convertToApiRule(rules);
          for (const apiRule of result) {
            expect(apiRule.condition.resourceTypes).toEqual(RESOURCE_TYPES);
          }
        }
      )
    );
  });

  it("empty requestDomains, initiatorDomains, and requestMethods arrays are omitted from the API rule", () => {
    fc.assert(
      fc.property(
        fc.array(
          storedRuleArb.map((rule) => ({
            ...rule,
            condition: {
              ...rule.condition,
              requestDomains: [],
              initiatorDomains: [],
              requestMethods: [],
            },
          }))
        ),
        (rules) => {
          const result = convertToApiRule(rules);
          for (const apiRule of result) {
            expect(apiRule.condition.requestDomains).toBeUndefined();
            expect(apiRule.condition.initiatorDomains).toBeUndefined();
            expect(apiRule.condition.requestMethods).toBeUndefined();
          }
        }
      )
    );
  });

  it("urlFilter and regexFilter are never both set", () => {
    fc.assert(
      fc.property(fc.array(storedRuleArb), (rules) => {
        const result = convertToApiRule(rules);
        for (const apiRule of result) {
          const bothSet =
            apiRule.condition.urlFilter !== undefined &&
            apiRule.condition.regexFilter !== undefined;
          expect(bothSet).toBe(false);
        }
      })
    );
  });

  it("urlFilter with isRegexFilter=true is mapped to regexFilter", () => {
    fc.assert(
      fc.property(
        fc.array(
          storedRuleArb.map((rule) => ({
            ...rule,
            condition: {
              ...rule.condition,
              urlFilter: rule.condition.urlFilter ?? "example",
              isRegexFilter: true,
            },
          }))
        ),
        (rules) => {
          const result = convertToApiRule(rules);
          for (let i = 0; i < result.length; i++) {
            expect(result[i].condition.regexFilter).toBe(
              rules[i].condition.urlFilter
            );
            expect(result[i].condition.urlFilter).toBeUndefined();
          }
        }
      )
    );
  });

  it("urlFilter with isRegexFilter=false/undefined is kept as urlFilter", () => {
    fc.assert(
      fc.property(
        fc.array(
          storedRuleArb.chain((rule) =>
            fc
              .constantFrom(false as false | undefined, undefined)
              .map((isRegexFilter) => ({
                ...rule,
                condition: {
                  ...rule.condition,
                  urlFilter: rule.condition.urlFilter ?? "example",
                  isRegexFilter,
                },
              }))
          )
        ),
        (rules) => {
          const result = convertToApiRule(rules);
          for (let i = 0; i < result.length; i++) {
            expect(result[i].condition.urlFilter).toBe(
              rules[i].condition.urlFilter
            );
            expect(result[i].condition.regexFilter).toBeUndefined();
          }
        }
      )
    );
  });
});
