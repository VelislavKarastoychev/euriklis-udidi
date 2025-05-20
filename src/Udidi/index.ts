"use strict";
import * as errors from "./Errors";
import type {
  AnyUdidiSchema,
  AsyncFunction,
  Integer,
  SchemaOf,
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

  get serializedSchema(): string {
    const replacer = (_key: string, value: any): string => {
      if (value === Infinity) return "Infinity";
      if (value === -Infinity) return "-Infinity";
      if (typeof value === "function") return value.toString();
      if (Number.isNaN(value)) return "NaN";
      return value;
    };
    return JSON.stringify(
      { ...this.schema, description: this.description },
      replacer,
    );
  }

  get description(): string {
    return this.__DESCRIPTION__;
  }

  set description(description: string) {
    this.__DESCRIPTION__ = description;
  }
}

export class UdidiBooleanSchema extends UdidiSchema<boolean> {
  constructor() {
    super({ $isType: "Boolean" });
  }

  isTrue(): UdidiBooleanSchema {
    return this.update({ $same: true });
  }

  isFalse(): UdidiBooleanSchema {
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

  equals(n: number): UdidiNumberSchema {
    return this.update({ $same: n });
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

export class UdidiSchemaOld<T = unknown> extends UdidiSchema<T> {
  boolean(): UdidiSchema<boolean> {
    return new UdidiSchema<boolean>({ $isType: "Boolean" });
  }

  string(): UdidiSchema<string> {
    const schema: UdidiSchemaType = { $isType: "String" };
    return new UdidiSchema<string>(schema);
  }

  number(): UdidiSchema<number> {
    const schema: UdidiSchemaType = { $isType: "Number" };
    return new UdidiSchema<number>(schema);
  }

  integer(): UdidiSchema<number> {
    return new UdidiSchema<number>({ $isType: "Integer" });
  }

  float(): UdidiSchema<number> {
    return new UdidiSchema<number>({ $isType: "Float" });
  }

  null(): UdidiSchema<null> {
    const schema: UdidiSchemaType = { $isType: "Null" };
    return new UdidiSchema<null>(schema);
  }

  undefined(): UdidiSchema<undefined> {
    const schema: UdidiSchemaType = { $isType: "Undefined" };
    return new UdidiSchema<undefined>(schema);
  }

  array<U>(schema: UdidiSchema<U>): UdidiSchema<U[]> {
    return new UdidiSchema<U[]>({
      $isType: "Array",
      $every: schema.schema,
    });
  }

  numberArray(): UdidiSchema<number[]> {
    return new UdidiSchema<number[]>({
      $isType: "Array",
      $every: { $isType: "Number" },
    });
  }

  stringArray(): UdidiSchema<string[]> {
    return new UdidiSchema<string[]>({
      $isType: "Array",
      $every: { $isType: "String" },
    });
  }

  Int8Array(): UdidiSchema<Int8Array> {
    return new UdidiSchema<Int8Array>({ $isType: "Int8Array" });
  }

  Uint8Array(): UdidiSchema<Uint8Array> {
    return new UdidiSchema<Uint8Array>({ $isType: "Uint8Array" });
  }

  Uint8ClampedArray(): UdidiSchema<Uint8ClampedArray> {
    return new UdidiSchema<Uint8ClampedArray>({ $isType: "Uint8ClampedArray" });
  }

  Int16Array(): UdidiSchema<Int16Array> {
    return new UdidiSchema<Int16Array>({ $isType: "Int16Array" });
  }

  Uint16Array(): UdidiSchema<Uint16Array> {
    return new UdidiSchema<Uint16Array>({ $isType: "Uint16Array" });
  }

  Int32Array(): UdidiSchema<Int32Array> {
    return new UdidiSchema<Int32Array>({ $isType: "Int32Array" });
  }

  Uint32Array(): UdidiSchema<Uint32Array> {
    return new UdidiSchema<Uint32Array>({ $isType: "Uint32Array" });
  }

  Float32Array(): UdidiSchema<Float32Array> {
    return new UdidiSchema<Float32Array>({ $isType: "Float32Array" });
  }

  Float64Array(): UdidiSchema<Float64Array> {
    return new UdidiSchema<Float64Array>({ $isType: "Float64Array" });
  }

  email(): UdidiSchema<string> {
    return new UdidiSchema<string>({ $isType: "Email" });
  }

  url(): UdidiSchema<string> {
    return new UdidiSchema<string>({ $isType: "URL" });
  }

  date(): UdidiSchema<Date> {
    return new UdidiSchema<Date>({ $isType: "Date" });
  }

  promise<U>(): UdidiSchema<Promise<U>> {
    return new UdidiSchema<Promise<U>>({ $isType: "Promise" });
  }

  function(): UdidiSchema<Function> {
    return new UdidiSchema<Function>({ $isType: "Function" });
  }

  asyncFunction(): UdidiSchema<AsyncFunction> {
    return new UdidiSchema<AsyncFunction>({ $isType: "AsyncFunction" });
  }
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
    return new UdidiInt8ArraySchema();
  }
}

export namespace Udidi {
  export type Infer<U extends UdidiSchema<any>> =
    U extends UdidiSchema<infer R> ? R : never;
}
