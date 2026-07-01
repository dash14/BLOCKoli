import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { unique, uniqueObjects } from "./unique";

describe("unique (property-based)", () => {
  describe("unique", () => {
    // Use a small range to ensure duplicates are reliably generated
    const intArb = fc.integer({ min: 0, max: 10 });

    it("is idempotent", () => {
      fc.assert(
        fc.property(fc.array(intArb), (list) => {
          const once = unique(list);
          expect(unique(once)).toEqual(once);
        })
      );
    });

    it("result is a subset of the input (length)", () => {
      fc.assert(
        fc.property(fc.array(intArb), (list) => {
          expect(unique(list).length).toBeLessThanOrEqual(list.length);
        })
      );
    });

    it("contains all elements from the input", () => {
      fc.assert(
        fc.property(fc.array(intArb), (list) => {
          const resultSet = new Set(unique(list));
          for (const item of list) {
            expect(resultSet.has(item)).toBe(true);
          }
        })
      );
    });

    it("has no duplicate elements", () => {
      fc.assert(
        fc.property(fc.array(intArb), (list) => {
          const result = unique(list);
          expect(new Set(result).size).toBe(result.length);
        })
      );
    });

    it("preserves the order of first occurrences", () => {
      fc.assert(
        fc.property(fc.array(intArb), (list) => {
          const result = unique(list);
          // Verify each result element's position matches its first occurrence in the input
          const firstOccurrenceIndices = result.map((item) =>
            list.indexOf(item)
          );
          for (let i = 1; i < firstOccurrenceIndices.length; i++) {
            expect(firstOccurrenceIndices[i]).toBeGreaterThan(
              firstOccurrenceIndices[i - 1]
            );
          }
        })
      );
    });
  });

  describe("uniqueObjects", () => {
    it("is idempotent", () => {
      fc.assert(
        fc.property(fc.array(fc.jsonValue()), (list) => {
          expect(uniqueObjects(uniqueObjects(list))).toEqual(uniqueObjects(list));
        })
      );
    });

    it("result is a subset of the input (length)", () => {
      fc.assert(
        fc.property(fc.array(fc.jsonValue()), (list) => {
          expect(uniqueObjects(list).length).toBeLessThanOrEqual(list.length);
        })
      );
    });

    it("contains all distinct JSON-serializable elements from the input", () => {
      fc.assert(
        fc.property(fc.array(fc.jsonValue()), (list) => {
          const result = uniqueObjects(list);
          for (const item of list) {
            const key = JSON.stringify(item);
            expect(result.some((r) => JSON.stringify(r) === key)).toBe(true);
          }
        })
      );
    });

    it("has no duplicate elements (by JSON.stringify)", () => {
      fc.assert(
        fc.property(fc.array(fc.jsonValue()), (list) => {
          const result = uniqueObjects(list);
          const keys = result.map((v) => JSON.stringify(v));
          expect(new Set(keys).size).toBe(keys.length);
        })
      );
    });

    it("preserves the order of first occurrences", () => {
      fc.assert(
        fc.property(fc.array(fc.jsonValue()), (list) => {
          const result = uniqueObjects(list);
          // Each result element must be the first occurrence in the input with that key,
          // and those first-occurrence positions must be strictly increasing.
          const firstOccurrenceIndices = result.map((item) => {
            const key = JSON.stringify(item);
            return list.findIndex((v) => JSON.stringify(v) === key);
          });
          for (let i = 1; i < firstOccurrenceIndices.length; i++) {
            expect(firstOccurrenceIndices[i]).toBeGreaterThan(
              firstOccurrenceIndices[i - 1]
            );
          }
        })
      );
    });
  });
});
