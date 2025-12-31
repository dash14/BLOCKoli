import { describe, expect, it } from "vitest";
import type { RulePointer, MatchedRule } from "./matched";

describe("matched", () => {
  describe("RulePointer", () => {
    it("has correct structure", () => {
      const pointer: RulePointer = {
        ruleSetName: "My Rules",
        number: 1,
        isBlocking: true,
      };

      expect(pointer.ruleSetName).toBe("My Rules");
      expect(pointer.number).toBe(1);
      expect(pointer.isBlocking).toBe(true);
    });

    it("can represent blocking rule", () => {
      const pointer: RulePointer = {
        ruleSetName: "Block Ads",
        number: 5,
        isBlocking: true,
      };

      expect(pointer.isBlocking).toBe(true);
    });

    it("can represent non-blocking rule", () => {
      const pointer: RulePointer = {
        ruleSetName: "Allow List",
        number: 3,
        isBlocking: false,
      };

      expect(pointer.isBlocking).toBe(false);
    });

    it("number can be any positive integer", () => {
      const pointer: RulePointer = {
        ruleSetName: "Test",
        number: 100,
        isBlocking: true,
      };

      expect(pointer.number).toBe(100);
    });

    it("number can be zero", () => {
      const pointer: RulePointer = {
        ruleSetName: "Test",
        number: 0,
        isBlocking: true,
      };

      expect(pointer.number).toBe(0);
    });
  });

  describe("MatchedRule", () => {
    it("has correct structure", () => {
      const matched: MatchedRule = {
        ruleId: 42,
        rule: {
          ruleSetName: "My Rules",
          number: 1,
          isBlocking: true,
        },
        timeStamp: 1234567890,
      };

      expect(matched.ruleId).toBe(42);
      expect(matched.rule.ruleSetName).toBe("My Rules");
      expect(matched.rule.number).toBe(1);
      expect(matched.rule.isBlocking).toBe(true);
      expect(matched.timeStamp).toBe(1234567890);
    });

    it("ruleId matches the stored rule id", () => {
      const matched: MatchedRule = {
        ruleId: 123,
        rule: {
          ruleSetName: "Test",
          number: 0,
          isBlocking: true,
        },
        timeStamp: Date.now(),
      };

      expect(matched.ruleId).toBe(123);
    });

    it("timeStamp is a number", () => {
      const now = Date.now();
      const matched: MatchedRule = {
        ruleId: 1,
        rule: {
          ruleSetName: "Test",
          number: 0,
          isBlocking: false,
        },
        timeStamp: now,
      };

      expect(typeof matched.timeStamp).toBe("number");
      expect(matched.timeStamp).toBe(now);
    });

    it("can be stored in array", () => {
      const matchedRules: MatchedRule[] = [
        {
          ruleId: 1,
          rule: { ruleSetName: "Set A", number: 0, isBlocking: true },
          timeStamp: 1000,
        },
        {
          ruleId: 2,
          rule: { ruleSetName: "Set B", number: 1, isBlocking: false },
          timeStamp: 2000,
        },
      ];

      expect(matchedRules).toHaveLength(2);
      expect(matchedRules[0].ruleId).toBe(1);
      expect(matchedRules[1].ruleId).toBe(2);
    });
  });
});
