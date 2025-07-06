import { test, expect } from "bun:test";
import { udidi } from "../src";

const positiveInt = udidi.number().gt(0);

test("safeParse succeeds for valid input", () => {
  const result = positiveInt.safeParse(5);
  expect(result.success).toBe(true);
});

test("safeParse fails for invalid input", () => {
  const result = positiveInt.safeParse(-2);
  expect(result.success).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});

test("parse throws on invalid input", () => {
  expect(() => positiveInt.parse(-1)).toThrow();
});

test("typed array validation", () => {
  const schema = udidi.int8Array().hasLength(2);
  expect(schema.safeParse(new Int8Array([1, 2])).success).toBe(true);
  expect(schema.safeParse(new Int8Array([1, 2, 3])).success).toBe(false);
});

test("parse validate correctly the same method:", () => {
  const myBuffer = new Float64Array([Math.PI, Math.E]).buffer;
  const myClonedBuffer = new Float64Array([Math.PI, Math.E]).buffer;
  const myTypedArray = new Float32Array([1, Math.PI, Math.E, Math.exp(2)]);
  const myClonedTypedArray = new Float32Array([
    1,
    Math.PI,
    Math.E,
    Math.exp(2),
  ]);
  const schema = udidi.object({
    age: udidi.number().isInteger.isPositive.equals(39),
    name: udidi.string().equals("John"),
    scores: udidi
      .array(udidi.number().isFloat)
      .equals([1.1, 6.5, 4.999])
      .hasLength(3),
    buffer: udidi.arrayBuffer().equals(myBuffer),
    typedArray: udidi.float32Array().equals(myTypedArray),
  });
  const student: udidi.Infer<typeof schema> = {
    age: 39,
    name: "John",
    scores: [1.1, 6.5, 4.999],
    buffer: myClonedBuffer,
    typedArray: myClonedTypedArray,
  };
  expect(() => schema.parse(student)).not.toThrow();
});

test("any schema accepts arbitrary values", () => {
  const schema = udidi.any();
  expect(schema.safeParse(123).success).toBe(true);
  expect(schema.safeParse("hello").success).toBe(true);
});

test("never schema rejects all values", () => {
  const schema = udidi.never();
  expect(schema.safeParse(123).success).toBe(false);
  expect(schema.safeParse("hello").success).toBe(false);
});

test("enum schema validates allowed values", () => {
  const schema = udidi.enum(["red", "green", "blue"]);
  expect(schema.safeParse("red").success).toBe(true);
  expect(schema.safeParse("yellow").success).toBe(false);
});

test("set schema validates members", () => {
  const schema = udidi.set(udidi.number()).hasLength(2);
  expect(schema.safeParse(new Set([1, 2])).success).toBe(true);
  expect(schema.safeParse(new Set([1, 2, 3])).success).toBe(false);
});

test("map schema validates key and value", () => {
  const schema = udidi.map(udidi.string(), udidi.number());
  const good = new Map<string, number>([["a", 1]]);
  const bad = new Map<any, any>([[1, "b"]]);
  expect(schema.safeParse(good).success).toBe(true);
  expect(schema.safeParse(bad).success).toBe(false);
});

test("email validation with default settings", () => {
  const schema = udidi.string().email();
  expect(schema.safeParse("user@example.com").success).toBe(true);
  expect(schema.safeParse("not-an-email").success).toBe(false);
});

test("email validation with domain option", () => {
  const schema = udidi.string().email({ domain: "example.com" });
  expect(schema.safeParse("foo@example.com").success).toBe(true);
  expect(schema.safeParse("foo@test.com").success).toBe(false);
});

test("url validation with default settings", () => {
  const schema = udidi.string().url();
  expect(schema.safeParse("https://example.com").success).toBe(true);
  expect(schema.safeParse("not a url").success).toBe(false);
});

test("url validation with hostname option", () => {
  const schema = udidi.string().url({ hostname: "example.com" });
  expect(schema.safeParse("https://example.com/path").success).toBe(true);
  expect(schema.safeParse("https://other.com").success).toBe(false);
});
