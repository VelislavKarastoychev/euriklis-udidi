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
  const myClonedBuffer = new Float64Array([Math.PI, Math.PI, Math.E]).buffer;
  const schema = udidi.object({
    age: udidi.number().isInteger.isPositive.equals(39),
    name: udidi.string().equals("John"),
    scores: udidi.array(udidi.number().isFloat).equals([1.1, 6.5, 4.999]),
    buffer: udidi.arrayBuffer().equals(myBuffer),
  });
  const student: udidi.Infer<typeof schema> = {
    age: 39,
    name: "John",
    scores: [1.1, 6.5, 4.999],
    buffer: myClonedBuffer,
  };
  expect(() => schema.parse(student)).not.toThrow();
});
