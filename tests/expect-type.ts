export function expectTypeOf<T>() {
  return {
    toEqualTypeOf<U>() {
      return true;
    },
  };
}
