"use strict";
import * as errors from "./Errors";
import {
  UdidiSchema,
  UdidiArrayBufferSchema,
  UdidiArraySchema,
  UdidiAsyncFunctionSchema,
  UdidiBigIntSchema,
  UdidiBooleanSchema,
  UdidiEnumSchema,
  UdidiFloat32ArraySchema,
  UdidiFloat64ArraySchema,
  UdidiFunctionSchema,
  UdidiInt16ArraySchema,
  UdidiInt32ArraySchema,
  UdidiInt8ArraySchema,
  UdidiMapSchema,
  UdidiNullSchema,
  UdidiNumberSchema,
  UdidiNumericArraySchema,
  UdidiObjectSchema,
  UdidiPromiseSchema,
  UdidiSetSchema,
  UdidiStringSchema,
  UdidiSymbolSchema,
  UdidiTypedArraySchema,
  UdidiUint16ArraySchema,
  UdidiUint32ArraySchema,
  UdidiUint8ArraySchema,
  UdidiUndefinedSchema,
} from "./Models/UdidiSchemas";
import type {
  AnyUdidiSchema,
  Expand,
  SchemaOf,
  Shape,
  UnionToIntersection,
} from "../../Types";

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

  static union<S extends AnyUdidiSchema[]>(
    schemas: [...S],
  ): UdidiSchema<SchemaOf<S[number]>> {
    return new UdidiSchema<SchemaOf<S[number]>>({
      $or: schemas.map((s) => s.schema),
    });
  }

  static intersection<S extends AnyUdidiSchema[]>(
    schemas: [...S],
  ): UdidiSchema<UnionToIntersection<SchemaOf<S[number]>>> {
    return new UdidiSchema<UnionToIntersection<SchemaOf<S[number]>>>({
      $and: schemas.map((s) => s.schema),
    });
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
