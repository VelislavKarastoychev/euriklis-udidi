"use strict";
import * as errors from "./Errors";
import * as models from "./Models";
import type {
  AnyUdidiSchema,
  AsyncFunction,
  Expand,
  Integer,
  OutputOfShape,
  SafeParseObjectType,
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

  safeParse(data: unknown): SafeParseObjectType {
    const errors: string[] = [];

    const validate = (value: any, schema: UdidiSchemaType): boolean => {
      if ((schema as any).$optional && value === undefined) return true;

      for (const key in schema) {
        const rule: any = (schema as any)[key];
        switch (key) {
          case "$and":
            return (rule as UdidiSchemaType[]).every((s) => validate(value, s));
          case "$or":
            return (rule as UdidiSchemaType[]).some((s) => validate(value, s));
          case "$not":
            return !validate(value, rule as UdidiSchemaType);
          case "$props":
            if (typeof value !== "object" || value === null) {
              errors.push("Expected object");
              return false;
            }
            for (const prop in rule) {
              if (!validate((value as any)[prop], rule[prop])) return false;
            }
            break;
          case "$every":
            if (!Array.isArray(value)) {
              errors.push("Expected array");
              return false;
            }
            for (const v of value) if (!validate(v, rule)) return false;
            break;
          case "$setOf":
            if (!(value instanceof Set)) {
              errors.push("Expected set");
              return false;
            }
            for (const v of value.values())
              if (!validate(v, rule)) return false;
            break;
          case "$entries":
            if (!(value instanceof Map)) {
              errors.push("Expected map");
              return false;
            }
            for (const [k, v] of value.entries()) {
              if (!validate(k, rule[0]) || !validate(v, rule[1])) return false;
            }
            break;
          case "$enum":
            if (!Array.isArray(rule) || !rule.includes(value)) {
              errors.push(`Expected one of ${rule.join(", ")}`);
              return false;
            }
            break;
          case "$isType":
            if (!models.checkType(value, rule)) {
              errors.push(`Expected type ${rule}`);
              return false;
            }
            break;
          case "$same":
            if (!models.deepEqual(value, rule)) {
              const repr =
                typeof rule === "object" ? JSON.stringify(rule) : String(rule);
              errors.push(`Expected ${repr}`);
              return false;
            }
            break;
          case "$lt":
            if (!(value < rule)) {
              errors.push(`Expected < ${rule}`);
              return false;
            }
            break;
          case "$gt":
            if (!(value > rule)) {
              errors.push(`Expected > ${rule}`);
              return false;
            }
            break;
          case "$leq":
            if (!(value <= rule)) {
              errors.push(`Expected <= ${rule}`);
              return false;
            }
            break;
          case "$geq":
            if (!(value >= rule)) {
              errors.push(`Expected >= ${rule}`);
              return false;
            }
            break;
          case "$neq":
            if (!(value !== rule)) {
              errors.push(`Expected != ${rule}`);
              return false;
            }
            break;
          case "$range":
            if (!(value >= rule[0] && value < rule[1])) {
              errors.push(`Expected in range [${rule[0]}, ${rule[1]})`);
              return false;
            }
            break;
          case "$closedRange":
            if (!(value >= rule[0] && value <= rule[1])) {
              errors.push(`Expected in range [${rule[0]}, ${rule[1]}]`);
              return false;
            }
            break;
          case "$hasLength": {
            const len = value?.length ?? value?.size;
            if (len !== rule) {
              errors.push(`Expected length ${rule}`);
              return false;
            }
            break;
          }
          case "$hasLengthLessThan": {
            const len = value?.length ?? value?.size;
            if (!(len < rule)) {
              errors.push(`Expected length < ${rule}`);
              return false;
            }
            break;
          }
          case "$hasLengthGreaterThan": {
            const len = value?.length ?? value?.size;
            if (!(len > rule)) {
              errors.push(`Expected length > ${rule}`);
              return false;
            }
            break;
          }
          case "$hasLengthInRange":
            if (
              !value ||
              !(value.length >= rule[0] && value.length < rule[1])
            ) {
              errors.push(`Expected length in range [${rule[0]}, ${rule[1]})`);
              return false;
            }
            break;
          case "$hasLengthInClosedRange": {
            const len = value?.length ?? value?.size;
            if (!(len >= rule[0] && len <= rule[1])) {
              errors.push(`Expected length in range [${rule[0]}, ${rule[1]}]`);
              return false;
            }
            break;
          }
          case "$match":
            if (typeof value !== "string" || !rule.test(value)) {
              errors.push(`Expected value to match ${rule}`);
              return false;
            }
            break;
          default:
            break;
        }
      }
      return true;
    };
    const success = validate(data, this.schema);
    return {
      success,
      data: success ? data : undefined,
      errors,
    };
  }

  parse(data: unknown): T {
    const result = this.safeParse(data);
    if (!result.success) {
      throw new Error(result.errors.join("; "));
    }
    return result.data as T;
  }
}

export class UdidiPromiseSchema<T = unknown> extends UdidiSchema<Promise<T>> {
  constructor() {
    super({ $isType: "Promise" });
  }

  returns<S extends UdidiSchema<any>>(
    u: S,
  ): UdidiPromiseSchema<Udidi.Infer<S>> {
    this.update({ $returns: u.schema });
    return this as unknown as UdidiPromiseSchema<Udidi.Infer<S>>;
  }
}

export class UdidiAsyncFunctionSchema<T = unknown> extends UdidiSchema<
  () => Promise<T>
> {
  constructor() {
    super({ $isType: "AsyncFunction" });
  }

  returns<S extends UdidiSchema<any>>(
    u: S,
  ): UdidiAsyncFunctionSchema<Udidi.Infer<S>> {
    this.update({ $returns: u.schema });
    return this as unknown as UdidiAsyncFunctionSchema<Udidi.Infer<S>>;
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

export class UdidiEnumSchema<T extends string | number> extends UdidiSchema<T> {
  constructor(values: readonly T[]) {
    super({ $enum: values });
  }
}

export class UdidiSetSchema<E = unknown> extends UdidiSchema<Set<E>> {
  constructor(member: AnyUdidiSchema = new UdidiSchema()) {
    super({ $isType: "Set", $setOf: member.schema });
  }

  of<S extends AnyUdidiSchema>(member: S): UdidiSetSchema<SchemaOf<S>> {
    return new UdidiSetSchema<SchemaOf<S>>(member);
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
}

export class UdidiMapSchema<K = unknown, V = unknown> extends UdidiSchema<
  Map<K, V>
> {
  constructor(
    key: AnyUdidiSchema = new UdidiSchema(),
    value: AnyUdidiSchema = new UdidiSchema(),
  ) {
    super({ $isType: "Map", $entries: [key.schema, value.schema] });
  }

  of<KS extends AnyUdidiSchema, VS extends AnyUdidiSchema>(
    key: KS,
    value: VS,
  ): UdidiMapSchema<SchemaOf<KS>, SchemaOf<VS>> {
    return new UdidiMapSchema<SchemaOf<KS>, SchemaOf<VS>>(key, value);
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

export class UdidiInt16ArraySchema extends UdidiTypedArraySchema<Int16Array> {
  constructor() {
    super("Int16Array");
  }
}

export class UdidiUint16ArraySchema extends UdidiTypedArraySchema<Uint16Array> {
  constructor() {
    super("Uint16Array");
  }
}

export class UdidiInt32ArraySchema extends UdidiTypedArraySchema<Int32Array> {
  constructor() {
    super("Int32Array");
  }
}

export class UdidiUint32ArraySchema extends UdidiTypedArraySchema<Uint32Array> {
  constructor() {
    super("Uint32Array");
  }
}

export class UdidiFloat32ArraySchema extends UdidiTypedArraySchema<Float32Array> {
  constructor() {
    super("Float32Array");
  }
}

export class UdidiFloat64ArraySchema extends UdidiTypedArraySchema<Float64Array> {
  constructor() {
    super("Float64Array");
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

export class UdidiSymbolSchema extends UdidiSchema<symbol> {
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

export class UdidiFunctionSchema<T = unknown> extends UdidiSchema<() => T> {
  constructor() {
    super({ $isType: "Function" });
  }

  returns<S extends UdidiSchema<any>>(
    u: S,
  ): UdidiFunctionSchema<Udidi.Infer<S>> {
    this.update({ $returns: u.schema });
    return this as unknown as UdidiFunctionSchema<Udidi.Infer<S>>;
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

  static enum<T extends string | number>(
    values: readonly T[],
  ): UdidiEnumSchema<T> {
    return new UdidiEnumSchema(values);
  }

  static set<S extends AnyUdidiSchema = UdidiSchema<unknown>>(
    member?: S,
  ): UdidiSetSchema<SchemaOf<S>> {
    return new UdidiSetSchema<SchemaOf<S>>(member ?? new UdidiSchema());
  }

  static map<
    K extends AnyUdidiSchema = UdidiSchema<unknown>,
    V extends AnyUdidiSchema = UdidiSchema<unknown>,
  >(key?: K, value?: V): UdidiMapSchema<SchemaOf<K>, SchemaOf<V>> {
    return new UdidiMapSchema<SchemaOf<K>, SchemaOf<V>>(
      key ?? new UdidiSchema(),
      value ?? new UdidiSchema(),
    );
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

  static int16Array() {
    return new UdidiInt16ArraySchema();
  }

  static uint16Array() {
    return new UdidiUint16ArraySchema();
  }

  static int32Array() {
    return new UdidiInt32ArraySchema();
  }

  static uint32Array() {
    return new UdidiUint32ArraySchema();
  }

  static float32Array() {
    return new UdidiFloat32ArraySchema();
  }

  static float64ArraySchema() {
    return new UdidiFloat64ArraySchema();
  }

  static arrayBuffer() {
    return new UdidiArrayBufferSchema();
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

  static function(): UdidiFunctionSchema {
    return new UdidiFunctionSchema();
  }

  static async(): UdidiAsyncFunctionSchema {
    return new UdidiAsyncFunctionSchema();
  }

  static promise(): UdidiPromiseSchema {
    return new UdidiPromiseSchema();
  }

  static any(): UdidiSchema<any> {
    return new UdidiSchema();
  }

  static never(): UdidiSchema<never> {
    return new UdidiSchema<never>({ $not: {} });
  }
}

export namespace Udidi {
  export type Infer<S extends UdidiSchema<any>> = Expand<
    S extends UdidiSchema<infer R> ? R : never
  >;
}
