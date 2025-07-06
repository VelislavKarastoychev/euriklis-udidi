import { test } from "bun:test";
import { expectTypeOf } from "./expect-type";
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

test("Udidi.Infer infers any", () => {
  const schema = udidi.any();
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<any>();
});

test("Udidi.Infer infers never", () => {
  const schema = udidi.never();
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<never>();
});

test("Udidi.Infer infers enum", () => {
  const schema = udidi.enum(["a", "b"]);
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<"a" | "b">();
});

test("Udidi.Infer infers set", () => {
  const schema = udidi.set(udidi.number());
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<Set<number>>();
});

test("Udidi.Infer infers map", () => {
  const schema = udidi.map(udidi.string(), udidi.number());
  type T = udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<Map<string, number>>();
});
