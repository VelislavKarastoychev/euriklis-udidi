"use strict";
import * as errors from "./Errors";
import type {
  AnyUdidiSchema,
  AsyncFunction,
  Expand,
  Integer,
  OutputOfShape,
  SchemaOf,
  Shape,
  TypedArray,
  TypedArrayNames,
  UdidiSchemaType,
} from "../../Types";

export class UdidiSchema<T = unknown> {
  private __SCHEMA__: UdidiSchemaType = {};
  private __DESCRIPTION__: string = "";
  constructor(schema: UdidiSchemaType = {}) {
    this.schema = schema;
  }

  get schema(): UdidiSchemaType {
    return this.__SCHEMA__;
  }

  set schema(schema: UdidiSchemaType) {
    this.__SCHEMA__ = schema;
  }

  set updateSchema(schema: UdidiSchemaType) {
    this.__SCHEMA__ = { ...this.__SCHEMA__, ...schema };
  }

  or<U>(other: UdidiSchema<U>): UdidiSchema<T | U> {
    const mergedSchema: UdidiSchemaType = { $or: [this.schema, other.schema] };
    return new UdidiSchema<T | U>(mergedSchema);
  }

  and<U>(other: UdidiSchema<U>): UdidiSchema<T & U> {
    const mergedSchema: UdidiSchemaType = {
      $and: [this.__SCHEMA__, other.schema],
    };
    return new UdidiSchema<T & U>(mergedSchema);
  }

  not<U>(schema: UdidiSchema<U>): UdidiSchema<T> {
    const negatedSchema: UdidiSchemaType = { $not: schema.schema };
    return new UdidiSchema<T>(negatedSchema);
  }

  protected update(obj: UdidiSchemaType): this {
    this.updateSchema = { ...this.updateSchema, ...obj };
    return this;
  }

  protected _clone<R extends UdidiSchema<unknown>>(): R {
    const c = Object.create(this.constructor.prototype);
    Object.assign(c, this);
    return c;
  }

  get serializedSchema(): string {
    const replacer = (_key: string, value: any): string => {
      if (value === Infinity) return "Infinity";
      if (value === -Infinity) return "-Infinity";
      if (typeof value === "function") return value.toString();
      if (Number.isNaN(value)) return "NaN";
      return value;
    };
    return JSON.stringify(
      { ...this.schema, $description: this.description },
      replacer,
    );
  }

  get description(): string {
    return this.__DESCRIPTION__;
  }

  set description(description: string) {
    this.__DESCRIPTION__ = description;
  }

  describe(description: string): this {
    this.description = description;
    return this;
  }

  optional(): this & UdidiSchema<T | undefined> {
    const clone = this._clone<this & UdidiSchema<T | undefined>>();
    clone.update({ $optional: true }); // ← store the flag in its own tree
    return clone;
  }

  equals(item: T): this {
    return this.update({ $same: item });
  }
}

export class UdidiBooleanSchema extends UdidiSchema<boolean> {
  constructor() {
    super({ $isType: "Boolean" });
  }

  true(): UdidiBooleanSchema {
    return this.update({ $same: true });
  }

  false(): UdidiBooleanSchema {
    return this.update({ $same: false });
  }
}

export class UdidiStringSchema extends UdidiSchema<string> {
  constructor() {
    super({ $isType: "String" });
  }

  hasLength(n: Integer): UdidiStringSchema {
    return this.update({ $hasLength: n });
  }

  hasLengthLessThan(n: Integer): UdidiStringSchema {
    return this.update({ $hasLengthLessThan: n });
  }
  hasLengthGreaterThan(n: Integer): UdidiStringSchema {
    return this.update({ $hasLengthGreaterThan: n });
  }

  hasLengthInRange(m: Integer, n: Integer): this {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $range: [m, n] });
  }

  hasLengthInClosedRange(m: Integer, n: Integer): this {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $closedRange: [m, n] });
  }

  match(regex: RegExp): this {
    return this.update({ $match: regex });
  }
}

class UdidiNumberSchema extends UdidiSchema<number> {
  constructor() {
    super({ $isType: "Number" });
  }

  isLessThan(n: number = 0): UdidiNumberSchema {
    return this.update({ $lt: n });
  }

  lt(n: number = 0): UdidiNumberSchema {
    return this.isLessThan(n);
  }

  isGreaterThan(n: number = 0): UdidiNumberSchema {
    this.updateSchema = { $gt: n };
    return this;
  }

  gt(n: number = 0): UdidiNumberSchema {
    return this.isGreaterThan(n);
  }

  neq(n: number = 0): UdidiNumberSchema {
    return this.update({ $neq: n });
  }

  isInRange(x: number, y: number): UdidiNumberSchema {
    return this.update({ $range: [x, y] });
  }

  isInClosedRange(x: number, y: number): UdidiNumberSchema {
    return this.update({ $closedRange: [x, y] });
  }

  get isPositive(): UdidiNumberSchema {
    const n = 0;
    return this.gt().or(new UdidiNumberSchema().equals(n)) as UdidiNumberSchema;
  }

  get isNegative(): UdidiNumberSchema {
    return this.lt();
  }

  get isPositiveInfinity(): UdidiNumberSchema {
    return this.update({ $same: Infinity });
  }

  get isNegativeInfinity(): UdidiNumberSchema {
    return this.update({ $same: -Infinity });
  }

  get isFloat(): UdidiNumberSchema {
    this.update({ $isType: "Float" });
    return this;
  }

  get isInteger(): UdidiNumberSchema {
    this.update({ $isType: "Integer" });
    return this;
  }

  get isNaN(): UdidiNumberSchema {
    this.update({ $isType: "NaN" });
    return this;
  }
}

export class UdidiUndefinedSchema extends UdidiSchema<undefined> {
  constructor() {
    super({ $isType: "Undefined" });
  }
}

export class UdidiNullSchema extends UdidiSchema<null> {
  constructor() {
    super({ $isType: "Null" });
  }
}

export class UdidiArraySchema<E = unknown> extends UdidiSchema<E[]> {
  /** internal helper that keeps `$isType:"Array"` + `$every` in sync */
  private static makeTree<S extends AnyUdidiSchema>(
    member: S,
  ): UdidiSchemaType {
    return { $isType: "Array", $every: member.schema } as UdidiSchemaType;
  }

  constructor(member: AnyUdidiSchema = new UdidiSchema()) {
    super(UdidiArraySchema.makeTree(member));
  }

  of<S extends AnyUdidiSchema>(member: S): UdidiArraySchema<SchemaOf<S>> {
    return new UdidiArraySchema<SchemaOf<S>>(member);
  }

  hasLength(n: Integer): UdidiArraySchema {
    return this.update({ $hasLength: n });
  }

  hasLengthLessThan(n: Integer): UdidiArraySchema {
    return this.update({ $hasLengthLessThan: n });
  }

  hasLengthGreaterThan(n: Integer): UdidiArraySchema {
    return this.update({ $hasLengthGreaterThan: n });
  }

  hasLengthInRange(m: Integer, n: Integer): UdidiArraySchema {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $hasLengthInRange: [m, n] });
  }

  hasLengthInClosedRange(m: Integer, n: Integer): UdidiArraySchema {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $hasLengthInClosedRange: [m, n] });
  }
}

export class UdidiNumericArraySchema extends UdidiArraySchema<number> {
  constructor() {
    super(Udidi.number()); // delegate to generic array ctor
  }
}

export class UdidiTypedArraySchema<
  E extends TypedArray = TypedArray,
> extends UdidiSchema<E> {
  constructor(typedArray: TypedArrayNames = "TypedArray") {
    super({ $isType: typedArray });
  }

  hasLength(n: Integer): this {
    return this.update({ $hasLength: n });
  }

  hasLengthLessThan(n: Integer): this {
    return this.update({ $hasLengthLessThan: n });
  }
  hasLengthGreaterThan(n: Integer): this {
    return this.update({ $hasLengthGreaterThan: n });
  }

  hasLengthInRange(m: Integer, n: Integer): this {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $hasLengthInRange: [m, n] });
  }

  hasLengthInClosedRange(m: Integer, n: Integer): this {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $hasLengthInClosedRange: [m, n] });
  }

  range(x: number, y: number): this {
    if (x > y) throw new Error(errors.IncorrectRangeInterval(x, y));
    return this.update({ $range: [x, y] });
  }

  closedRange(x: number, y: number): this {
    if (x > y) throw new Error(errors.IncorrectRangeInterval(x, y));
    return this.update({ $closedRange: [x, y] });
  }
}

export class UdidiInt8ArraySchema extends UdidiTypedArraySchema<Int8Array> {
  constructor() {
    super("Int8Array");
  }
}

export class UdidiUint8ArraySchema extends UdidiTypedArraySchema<Uint8Array> {
  constructor() {
    super("Uint8Array");
  }
}

export class UdidiArrayBufferSchema extends UdidiSchema<ArrayBuffer> {
  constructor() {
    super({ $isType: "ArrayBuffer" });
  }
}

export class UdidiBigIntSchema extends UdidiSchema<BigInt> {
  constructor() {
    super({ $isType: "BigInt" });
  }

  gt(n: number): this {
    return this.update({ $gt: n });
  }

  lt(n: number): this {
    return this.update({ $lt: n });
  }

  geq(n: number): this {
    return this.update({ $geq: n });
  }

  leq(n: number): this {
    return this.update({ $leq: n });
  }
}

export class UdidiSymbolSchema extends UdidiSchema<Symbol> {
  constructor() {
    super({ $isType: "Symbol" });
  }

  hasDescription(description: string | RegExp): this {
    return this.update({ $hasDescription: description });
  }

  inGlobalRegistry(): this {
    return this.update({ $global: true });
  }
  notInGlobalRegistry(): this {
    return this.update({ $global: false });
  }

  keyIs(key: string): this {
    return this.update({ $globalKey: key });
  }

  isWellKnown(): this {
    return this.update({ $wellKnown: true });
  }
}

export class UdidiObjectSchema<S extends Shape = {}> extends UdidiSchema<
  OutputOfShape<S>
> {
  private _shape: S;
  private static propsTree(shape: Shape): UdidiSchemaType {
    const props: Record<string, UdidiSchemaType> = {};
    for (const k in shape) props[k] = shape[k].schema;
    return { $isType: "Object", $props: props } as unknown as UdidiSchemaType;
  }

  constructor(shape: S = {} as S) {
    super(UdidiObjectSchema.propsTree(shape));
    this._shape = shape;
  }

  get shape(): S {
    return this._shape;
  }

  extend<T extends Shape>(extra: T): UdidiObjectSchema<S & T> {
    return new UdidiObjectSchema({ ...this._shape, ...extra });
  }

  pick<K extends keyof S>(...keys: K[]): UdidiObjectSchema<Pick<S, K>> {
    const subset: Partial<S> = {};
    keys.forEach((k) => {
      subset[k] = this._shape[k];
    });
    return new UdidiObjectSchema(subset as Pick<S, K>);
  }

  // partial(): UdidiObjectSchema<{ [K in keyof S]?: S[K] }> {
  //   // runtime: mark props optional
  //   const tree = { ...this.schema, $optional: Object.keys(this._shape) };
  //   const out = new UdidiObjectSchema(this._shape) as any;
  //   out.schema = tree;
  //   return out;
  // }
}

export class Udidi {
  static string(): UdidiStringSchema {
    return new UdidiStringSchema();
  }

  static number(): UdidiNumberSchema {
    return new UdidiNumberSchema();
  }

  static undefined(): UdidiUndefinedSchema {
    return new UdidiUndefinedSchema();
  }

  static boolean(): UdidiBooleanSchema {
    return new UdidiBooleanSchema();
  }

  static null(): UdidiNullSchema {
    return new UdidiNullSchema();
  }

  static array<S extends AnyUdidiSchema = UdidiSchema<unknown>>(
    member?: S,
  ): UdidiArraySchema<SchemaOf<S>> {
    return new UdidiArraySchema<SchemaOf<S>>(member ?? new UdidiSchema());
  }

  static typedArray(): UdidiTypedArraySchema {
    return new UdidiTypedArraySchema();
  }

  static int8Array(): UdidiInt8ArraySchema {
    return new UdidiInt8ArraySchema();
  }

  static uint8Array(): UdidiUint8ArraySchema {
    return new UdidiUint8ArraySchema();
  }

  static object<S extends Shape = {}>(shape?: S): UdidiObjectSchema<S> {
    return new UdidiObjectSchema(shape ?? ({} as S));
  }

  static symbol(): UdidiSymbolSchema {
    return new UdidiSymbolSchema();
  }

  static bigInt(): UdidiBigIntSchema {
    return new UdidiBigIntSchema();
  }
}

export namespace Udidi {
  export type Infer<S extends UdidiSchema<any>> = Expand<
    S extends UdidiSchema<infer R> ? R : never
  >;
}
