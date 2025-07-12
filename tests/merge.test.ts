import { test, expect } from "bun:test";
import { udidi } from "../src";

test("object.merge combines schemas", () => {
  const a = udidi.object({ foo: udidi.number() });
  const b = udidi.object({ bar: udidi.string() });
  const c = udidi.object({ default: udidi.set(udidi.string()).nullable() });

  const merged = a.merge(b).merge(c);
  type mergedType = udidi.Infer<typeof merged>;

  expect(merged.safeParse({ foo: 1, bar: "x", default: null }).success).toBe(
    true,
  );
  expect(merged.safeParse({ foo: 1 }).success).toBe(false);
  expect(merged.safeParse({ bar: "x" }).success).toBe(false);
});
