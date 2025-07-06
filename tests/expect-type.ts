// Minimal helper to perform compile-time type equality checks.
// The function returns an object with a `toEqualTypeOf` method whose
// generic parameter enforces bidirectional assignability between `T` and `U`.
// If the types differ, TypeScript will report an error during compilation.
export function expectTypeOf<T>() {
  return {
    toEqualTypeOf<U extends T & (T extends U ? unknown : never)>() {},
  };
}
