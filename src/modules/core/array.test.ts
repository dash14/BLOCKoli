import { describe, expect, it } from "vitest";
import { push, removeAt, replaceAt } from "./array";

describe("array", () => {
  describe("push", () => {
    it("adds item to end of array", () => {
      const list = [1, 2, 3];
      const result = push(list, 4);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("does not mutate original array", () => {
      const list = [1, 2, 3];
      const result = push(list, 4);

      expect(list).toEqual([1, 2, 3]);
      expect(result).not.toBe(list);
    });

    it("works with empty array", () => {
      const list: number[] = [];
      const result = push(list, 1);

      expect(result).toEqual([1]);
    });

    it("works with string array", () => {
      const list = ["a", "b"];
      const result = push(list, "c");

      expect(result).toEqual(["a", "b", "c"]);
    });

    it("works with object array", () => {
      const list = [{ id: 1 }, { id: 2 }];
      const result = push(list, { id: 3 });

      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe("removeAt", () => {
    it("removes item at specified index", () => {
      const list = [1, 2, 3, 4];
      const result = removeAt(list, 1);

      expect(result).toEqual([1, 3, 4]);
    });

    it("removes first item", () => {
      const list = [1, 2, 3];
      const result = removeAt(list, 0);

      expect(result).toEqual([2, 3]);
    });

    it("removes last item", () => {
      const list = [1, 2, 3];
      const result = removeAt(list, 2);

      expect(result).toEqual([1, 2]);
    });

    it("does not mutate original array", () => {
      const list = [1, 2, 3];
      const result = removeAt(list, 1);

      expect(list).toEqual([1, 2, 3]);
      expect(result).not.toBe(list);
    });

    it("returns same elements for out of bounds index", () => {
      const list = [1, 2, 3];
      const result = removeAt(list, 10);

      expect(result).toEqual([1, 2, 3]);
    });

    it("returns same elements for negative index", () => {
      const list = [1, 2, 3];
      const result = removeAt(list, -1);

      expect(result).toEqual([1, 2, 3]);
    });

    it("works with single element array", () => {
      const list = [1];
      const result = removeAt(list, 0);

      expect(result).toEqual([]);
    });

    it("works with object array", () => {
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = removeAt(list, 1);

      expect(result).toEqual([{ id: 1 }, { id: 3 }]);
    });
  });

  describe("replaceAt", () => {
    it("replaces item at specified index", () => {
      const list = [1, 2, 3];
      const result = replaceAt(list, 1, 10);

      expect(result).toEqual([1, 10, 3]);
    });

    it("replaces first item", () => {
      const list = [1, 2, 3];
      const result = replaceAt(list, 0, 10);

      expect(result).toEqual([10, 2, 3]);
    });

    it("replaces last item", () => {
      const list = [1, 2, 3];
      const result = replaceAt(list, 2, 10);

      expect(result).toEqual([1, 2, 10]);
    });

    it("does not mutate original array", () => {
      const list = [1, 2, 3];
      const result = replaceAt(list, 1, 10);

      expect(list).toEqual([1, 2, 3]);
      expect(result).not.toBe(list);
    });

    it("does not replace for out of bounds index", () => {
      const list = [1, 2, 3];
      const result = replaceAt(list, 10, 99);

      expect(result).toEqual([1, 2, 3]);
    });

    it("does not replace for negative index", () => {
      const list = [1, 2, 3];
      const result = replaceAt(list, -1, 99);

      expect(result).toEqual([1, 2, 3]);
    });

    it("works with object array", () => {
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = replaceAt(list, 1, { id: 20 });

      expect(result).toEqual([{ id: 1 }, { id: 20 }, { id: 3 }]);
    });

    it("works with string array", () => {
      const list = ["a", "b", "c"];
      const result = replaceAt(list, 1, "x");

      expect(result).toEqual(["a", "x", "c"]);
    });
  });
});
