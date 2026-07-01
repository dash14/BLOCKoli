import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { push, removeAt, replaceAt } from "./array";

describe("array (property-based)", () => {
  describe("push", () => {
    it("does not mutate the original list", () => {
      fc.assert(
        fc.property(fc.array(fc.integer()), fc.integer(), (list, item) => {
          const copy = [...list];
          push(list, item);
          expect(list).toEqual(copy);
        })
      );
    });

    it("increases length by 1", () => {
      fc.assert(
        fc.property(fc.array(fc.integer()), fc.integer(), (list, item) => {
          expect(push(list, item)).toHaveLength(list.length + 1);
        })
      );
    });

    it("appends item at the last position", () => {
      fc.assert(
        fc.property(fc.array(fc.integer()), fc.integer(), (list, item) => {
          const result = push(list, item);
          expect(result[list.length]).toBe(item);
        })
      );
    });

    it("preserves all original elements in order", () => {
      fc.assert(
        fc.property(fc.array(fc.integer()), fc.integer(), (list, item) => {
          expect(push(list, item).slice(0, list.length)).toEqual(list);
        })
      );
    });
  });

  describe("removeAt", () => {
    it("does not mutate the original list", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()),
          fc.integer(),
          (list, index) => {
            const copy = [...list];
            removeAt(list, index);
            expect(list).toEqual(copy);
          }
        )
      );
    });

    it("decreases length by 1 for a valid index", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1 }),
          fc.nat(),
          (list, offset) => {
            const index = offset % list.length;
            expect(removeAt(list, index)).toHaveLength(list.length - 1);
          }
        )
      );
    });

    it("preserves length for an out-of-bounds index", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()).chain((list) =>
            fc.tuple(
              fc.constant(list),
              fc.oneof(
                fc.integer({ max: -1 }),
                fc.nat().map((n) => list.length + n)
              )
            )
          ),
          ([list, index]) => {
            expect(removeAt(list, index)).toHaveLength(list.length);
          }
        )
      );
    });

    it("removes exactly the element at the specified valid index", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1 }),
          fc.nat(),
          (list, offset) => {
            const index = offset % list.length;
            const result = removeAt(list, index);
            const expected = [...list.slice(0, index), ...list.slice(index + 1)];
            expect(result).toEqual(expected);
          }
        )
      );
    });
  });

  describe("replaceAt", () => {
    it("does not mutate the original list", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()),
          fc.integer(),
          fc.integer(),
          (list, index, item) => {
            const copy = [...list];
            replaceAt(list, index, item);
            expect(list).toEqual(copy);
          }
        )
      );
    });

    it("always preserves length", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()),
          fc.integer(),
          fc.integer(),
          (list, index, item) => {
            expect(replaceAt(list, index, item)).toHaveLength(list.length);
          }
        )
      );
    });

    it("replaces the element at a valid index", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1 }),
          fc.nat(),
          fc.integer(),
          (list, offset, item) => {
            const index = offset % list.length;
            expect(replaceAt(list, index, item)[index]).toBe(item);
          }
        )
      );
    });

    it("leaves all other elements unchanged at a valid index", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1 }),
          fc.nat(),
          fc.integer(),
          (list, offset, item) => {
            const index = offset % list.length;
            const result = replaceAt(list, index, item);
            for (let i = 0; i < list.length; i++) {
              if (i !== index) {
                expect(result[i]).toBe(list[i]);
              }
            }
          }
        )
      );
    });

    it("returns the original list unchanged for an out-of-bounds index", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()).chain((list) =>
            fc.tuple(
              fc.constant(list),
              fc.oneof(
                fc.integer({ max: -1 }),
                fc.nat().map((n) => list.length + n)
              ),
              fc.integer()
            )
          ),
          ([list, index, item]) => {
            expect(replaceAt(list, index, item)).toEqual(list);
          }
        )
      );
    });
  });
});
