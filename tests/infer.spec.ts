import { test } from "bun:test";
import { expectTypeOf } from "expect-type";
import { Udidi } from "../src/Udidi";

test("Udidi.Infer infers async function", () => {
  const schema = Udidi.async().returns(Udidi.number());
  type T = Udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<() => Promise<number>>();
});

test("Udidi.Infer infers promise", () => {
  const schema = Udidi.promise().returns(Udidi.number());
  type T = Udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<Promise<number>>();
});

test("Udidi.Infer infers symbol", () => {
  const schema = Udidi.symbol();
  type T = Udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<symbol>();
});

test("Udidi.Infer infers function returning string array", () => {
  const schema = Udidi.function().returns(Udidi.array(Udidi.string()));
  type T = Udidi.Infer<typeof schema>;
  expectTypeOf<T>().toEqualTypeOf<() => string[]>();
});
