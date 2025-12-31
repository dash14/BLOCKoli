import { describe, expect, it } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import type { ExportedRuleSets } from "./export";

describe("export", () => {
  describe("ExportedRuleSets", () => {
    it("has correct structure with empty ruleSets", () => {
      const exported: ExportedRuleSets = {
        format: "BLOCKoli",
        version: 1,
        ruleSets: [],
      };

      expect(exported.format).toBe("BLOCKoli");
      expect(exported.version).toBe(1);
      expect(exported.ruleSets).toEqual([]);
    });

    it("has correct structure with ruleSets", () => {
      const exported: ExportedRuleSets = {
        format: "BLOCKoli",
        version: 1,
        ruleSets: [
          {
            name: "My Rules",
            rules: [
              {
                action: { type: RuleActionType.BLOCK },
                condition: {},
              },
            ],
          },
        ],
      };

      expect(exported.format).toBe("BLOCKoli");
      expect(exported.version).toBe(1);
      expect(exported.ruleSets).toHaveLength(1);
      expect(exported.ruleSets[0].name).toBe("My Rules");
    });

    it("format is literal type BLOCKoli", () => {
      const exported: ExportedRuleSets = {
        format: "BLOCKoli",
        version: 1,
        ruleSets: [],
      };

      // Type check - format must be exactly "BLOCKoli"
      expect(exported.format).toBe("BLOCKoli");
    });

    it("version is literal type 1", () => {
      const exported: ExportedRuleSets = {
        format: "BLOCKoli",
        version: 1,
        ruleSets: [],
      };

      // Type check - version must be exactly 1
      expect(exported.version).toBe(1);
    });

    it("can have multiple ruleSets", () => {
      const exported: ExportedRuleSets = {
        format: "BLOCKoli",
        version: 1,
        ruleSets: [
          { name: "Set 1", rules: [] },
          { name: "Set 2", rules: [] },
          { name: "Set 3", rules: [] },
        ],
      };

      expect(exported.ruleSets).toHaveLength(3);
      expect(exported.ruleSets[0].name).toBe("Set 1");
      expect(exported.ruleSets[1].name).toBe("Set 2");
      expect(exported.ruleSets[2].name).toBe("Set 3");
    });
  });
});
