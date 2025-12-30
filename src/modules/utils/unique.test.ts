import { describe, expect, it } from "vitest";
import { unique, uniqueObjects } from "./unique";

describe("unique", () => {
  describe("unique", () => {
    it("returns empty array for empty input", () => {
      const result = unique([]);
      expect(result).toEqual([]);
    });

    it("returns same array when all elements are unique", () => {
      const result = unique([1, 2, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it("removes duplicate numbers", () => {
      const result = unique([1, 2, 2, 3, 3, 3]);
      expect(result).toEqual([1, 2, 3]);
    });

    it("removes duplicate strings", () => {
      const result = unique(["a", "b", "a", "c", "b"]);
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("preserves order of first occurrence", () => {
      const result = unique([3, 1, 2, 1, 3, 2]);
      expect(result).toEqual([3, 1, 2]);
    });

    it("handles single element array", () => {
      const result = unique([42]);
      expect(result).toEqual([42]);
    });

    it("handles all same elements", () => {
      const result = unique([5, 5, 5, 5]);
      expect(result).toEqual([5]);
    });

    it("distinguishes different types", () => {
      const result = unique([1, "1", 1, "1"]);
      expect(result).toEqual([1, "1"]);
    });

    it("handles undefined and null", () => {
      const result = unique([undefined, null, undefined, null]);
      expect(result).toEqual([undefined, null]);
    });

    it("does not deduplicate objects by value (reference equality)", () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = unique([obj1, obj2, obj1]);
      // obj1 and obj2 are different references, so both are kept
      // obj1 appears twice but only once in result
      expect(result).toEqual([obj1, obj2]);
      expect(result).toHaveLength(2);
    });

    it("deduplicates same object references", () => {
      const obj = { a: 1 };
      const result = unique([obj, obj, obj]);
      expect(result).toEqual([obj]);
      expect(result).toHaveLength(1);
    });
  });

  describe("uniqueObjects", () => {
    it("returns empty array for empty input", () => {
      const result = uniqueObjects([]);
      expect(result).toEqual([]);
    });

    it("returns same array when all objects are unique", () => {
      const result = uniqueObjects([{ a: 1 }, { a: 2 }, { a: 3 }]);
      expect(result).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
    });

    it("removes duplicate objects by value", () => {
      const result = uniqueObjects([{ a: 1 }, { a: 2 }, { a: 1 }]);
      expect(result).toEqual([{ a: 1 }, { a: 2 }]);
    });

    it("removes duplicate objects with same properties in same order", () => {
      const result = uniqueObjects([
        { a: 1, b: 2 },
        { a: 1, b: 2 },
        { a: 1, b: 3 },
      ]);
      expect(result).toEqual([
        { a: 1, b: 2 },
        { a: 1, b: 3 },
      ]);
    });

    it("preserves order of first occurrence", () => {
      const result = uniqueObjects([{ x: 3 }, { x: 1 }, { x: 2 }, { x: 1 }]);
      expect(result).toEqual([{ x: 3 }, { x: 1 }, { x: 2 }]);
    });

    it("handles single element array", () => {
      const result = uniqueObjects([{ value: 42 }]);
      expect(result).toEqual([{ value: 42 }]);
    });

    it("handles all same objects", () => {
      const result = uniqueObjects([{ n: 5 }, { n: 5 }, { n: 5 }]);
      expect(result).toEqual([{ n: 5 }]);
    });

    it("handles nested objects", () => {
      const result = uniqueObjects([
        { outer: { inner: 1 } },
        { outer: { inner: 2 } },
        { outer: { inner: 1 } },
      ]);
      expect(result).toEqual([{ outer: { inner: 1 } }, { outer: { inner: 2 } }]);
    });

    it("handles arrays as elements", () => {
      const result = uniqueObjects([
        [1, 2, 3],
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
    });

    it("handles primitive values", () => {
      const result = uniqueObjects([1, 2, 1, 3, 2]);
      expect(result).toEqual([1, 2, 3]);
    });

    it("handles strings", () => {
      const result = uniqueObjects(["a", "b", "a"]);
      expect(result).toEqual(["a", "b"]);
    });

    it("handles null values", () => {
      const result = uniqueObjects([null, { a: 1 }, null]);
      expect(result).toEqual([null, { a: 1 }]);
    });

    it("treats objects with different property order as different", () => {
      // JSON.stringify produces different strings for different property orders
      const result = uniqueObjects([
        { a: 1, b: 2 },
        { b: 2, a: 1 },
      ]);
      // Note: This depends on JSON.stringify behavior
      // Objects with same properties but different order may be treated as different
      expect(result).toHaveLength(2);
    });
  });
});
