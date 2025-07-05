import { test } from "bun:test";
import { expectTypeOf } from "expect-type";
import { udidi } from "../src";

udidi.number().isInteger.isPositive;

test("Udidi.Infer infers async function", () => {
  const schema = udidi.async().returns(udidi.number());
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<() => Promise<number>>();
});

test("Udidi.Infer infers promise", () => {
  const schema = udidi.promise().returns(udidi.number());
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<Promise<number>>();
});

test("Udidi.Infer infers symbol", () => {
  const schema = udidi.symbol();
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<symbol>();
});

test("Udidi.Infer infers function returning string array", () => {
  const schema = udidi.function().returns(udidi.array(udidi.string()));
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<() => string[]>();
});
