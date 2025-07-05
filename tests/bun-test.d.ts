declare module "bun:test" {
  export function test(name: string, fn: () => any): void;
  export function expect(value: any): any;
}
