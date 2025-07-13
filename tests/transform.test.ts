import { test, expect } from "bun:test";
import { udidi } from "../src";

test("transform executes after validation", () => {
  const schema = udidi.string().transform((s) => s.length);
  const result = schema.safeParse("abcd");
  expect(result.success).toBe(true);
  expect(result.data).toBe(4);
  expect(schema.parse("abcd")).toBe(4);
});

test("transform is not called on invalid input", () => {
  const schema = udidi.string().transform((s) => s.length);
  const result = schema.safeParse(123);
  expect(result.success).toBe(false);
  expect(result.data).toBeUndefined();
});
