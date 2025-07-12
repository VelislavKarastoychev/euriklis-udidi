import { test, expect } from "bun:test";
import { udidi } from "../src";

test("union combines multiple schemas", () => {
  const schema = udidi.union([udidi.string(), udidi.number(), udidi.boolean()]);
  expect(schema.safeParse("hello").success).toBe(true);
  expect(schema.safeParse(42).success).toBe(true);
  expect(schema.safeParse(false).success).toBe(true);
  expect(schema.safeParse({}).success).toBe(false);
});

test("intersection combines multiple schemas", () => {
  const schema = udidi.intersection([
    udidi.object({ a: udidi.number() }),
    udidi.object({ b: udidi.string() }),
    udidi.object({ c: udidi.boolean() }),
  ]);
  expect(schema.safeParse({ a: 1, b: "x", c: true }).success).toBe(true);
  expect(schema.safeParse({ a: 1, b: "x" }).success).toBe(false);
});
