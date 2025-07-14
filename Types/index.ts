// Types/index.ts
import {
  UdidiSchema,
  UdidiSymbolSchema,
} from "../src/Udidi/Models/UdidiSchemas";
export type AsyncFunction = (...args: any[]) => Promise<any>;

export type Integer = number;
export type UdidiResponseType = {
  success: boolean;
  message: string;
  database: string;
  data: string | null;
  meta?: {
    queryTime?: string;
    resultCount?: number;
  };
};

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export type TypedArrayNames =
  | "TypedArray"
  | "Int8Array"
  | "Uint8Array"
  | "Uint8ClampedArray"
  | "Int16Array"
  | "Uint16Array"
  | "Int32Array"
  | "Uint32Array"
  | "Int64Array"
  | "Float32Array"
  | "Float64Array";

export type UdidiTypes =
  | "NaN"
  | "Null"
  | "Undefined"
  | "Empty"
  | "String"
  | "Number"
  | "BigInt"
  | "Symbol"
  | "Function"
  | "AsyncFunction"
  | "Generator"
  | "Promise"
  | "Boolean"
  | "Object"
  | "Array"
  | "NumberArray"
  | "StringArray"
  | "ArrayBuffer"
  | "Int8Matrix"
  | "Int16Matrix"
  | "Int32Matrix"
  | "Int64Matrix"
  | "Float32Matrix"
  | "Float64Matrix"
  | "Int8Tensor"
  | "Int16Tensor"
  | "Int32Tensor"
  | "Int64Tensor"
  | "Float32Tensor"
  | "Float64Tensor"
  | "interface"
  | "TypedArray"
  | "Int8Array"
  | "Uint8Array"
  | "Uint8ClampedArray"
  | "Int16Array"
  | "Uint16Array"
  | "Int32Array"
  | "Uint32Array"
  | "Int64Array"
  | "Float32Array"
  | "Float64Array"
  | "Set"
  | "Map"
  | "Integer"
  | "Float"
  | "Date"
  | "Email"
  | "URL"
  | "NumberLike";

export type UdidiDBActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "test";
export type GreaterThan = { $gt: number };
export type GreaterThanOrEqual = { $geq: number };
export type LessThan = { $lt: number };
export type LessThanOrEqual = { $leq: number };
export type SameAs = { $same: unknown };
export type NotEqualsTo = { $neq: number };
export type IsType = { $isType: UdidiTypes };
export type Any = { $any: UdidiSchemaType };
export type Every = { $every: UdidiSchemaType };
export type Optional = { $optional: boolean };
export type HasLength = { $hasLength: Integer };
export type HasLengthLessThan = { $hasLengthLessThan: Integer };
export type HasLengthGreaterThan = { $hasLengthGreaterThan: Integer };
export type HasLengthInRange =
  | { $hasLengthInRange: [Integer, Integer] } // for strings and arrays - like
  | { $hasLengthInClosedRange: [Integer, Integer] }; // for strings and array - like
export type InRange =
  | { $range: [number, number] }
  | { $closedRange: [number, number] };
export type MatchesRegex = { $match: RegExp };
export type EmailRule = { $email: true | { domain?: string } };
export type UrlRule = {
  $url: true | { hostname?: string; protocol?: string };
};
export type hasDescription = { $hasDescription: string | RegExp };
export type inGlobalRegistry = { $global: boolean };
export type globalKey = { $globalKey: string };
export type wellKnown = { $wellKnown: boolean };
export type Returns = { $returns: UdidiSchemaType };
export type EnumValues = { $enum: readonly (string | number)[] };
export type SetOf = { $setOf: UdidiSchemaType };
export type Entries = { $entries: [UdidiSchemaType, UdidiSchemaType] };
export type Trim = { $trim: true };
export type ToLowerCase = { $toLowerCase: true };
export type ToUpperCase = { $toUpperCase: true };
export type UUIDRule = {
  $uuid: true | { version?: "v1" | "v2" | "v3" | "v4" | "v5" };
};
export type EmojiRule = { $emoji: true };
export type Base64Rule = { $base64: true };
export type Base64UrlRule = { $base64url: true };
export type NanoIdRule = { $nanoid: true };
export type CuidRule = { $cuid: true };
export type Cuid2Rule = { $cuid2: true };
export type UlidRule = { $ulid: true };
export type IPv4Rule = { $ipv4: true };
export type IPv6Rule = { $ipv6: true };
export type CIDRv4Rule = { $cidrv4: true };
export type CIDRv6Rule = { $cidrv6: true };
export type ISODateRule = { $isodate: true };
export type ISOTimeRule = { $isotime: true };
export type ISODatetimeRule = { $isodatetime: true };
export type ISODurationRule = { $isoduration: true };

export type LOGICAL_EXPRESSIONS =
  | GreaterThan
  | GreaterThanOrEqual
  | LessThan
  | LessThanOrEqual
  | SameAs
  | Every
  | Any
  | IsType
  | NotEqualsTo
  | HasLength
  | HasLengthLessThan
  | HasLengthGreaterThan
  | HasLengthInRange
  | InRange
  | MatchesRegex
  | EmailRule
  | UrlRule
  | hasDescription
  | inGlobalRegistry
  | globalKey
  | wellKnown
  | EnumValues
  | SetOf
  | Entries
  | Optional
  | Returns
  | Trim
  | ToLowerCase
  | ToUpperCase
  | UUIDRule
  | EmojiRule
  | Base64Rule
  | Base64UrlRule
  | NanoIdRule
  | CuidRule
  | Cuid2Rule
  | UlidRule
  | IPv4Rule
  | IPv6Rule
  | CIDRv4Rule
  | CIDRv6Rule
  | ISODateRule
  | ISOTimeRule
  | ISODatetimeRule
  | ISODurationRule
  | ISODurationRule
  | StrictRule;

export type OPERATIONS = {
  $or?: (LOGICAL_EXPRESSIONS | OPERATIONS)[];
  $and?: (LOGICAL_EXPRESSIONS | OPERATIONS)[];
  $not?: LOGICAL_EXPRESSIONS | OPERATIONS;
};

export type UdidiSchemaType = LOGICAL_EXPRESSIONS | OPERATIONS; // Allow nested schemas
export type UdidiObjectSchemaType = {
  [prop: string]: UdidiSchemaType | UdidiObjectSchemaType;
};

export type UdidiProtocolType = {
  action: UdidiDBActionType;
  query: UdidiSchemaType;
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
  };
};

export type AnyUdidiSchema = UdidiSchema<any>;
export type SchemaOf<S> = S extends UdidiSchema<infer U> ? U : never;
export type TreeOf<S> = S extends UdidiSchema<any> ? S["schema"] : never;
export type Shape = { [key: string]: AnyUdidiSchema };

export type OptionalKeys<S extends Shape> = {
  [K in keyof S]: undefined extends SchemaOf<S[K]> ? K : never;
}[keyof S];

export type RequiredKeys<S extends Shape> = Exclude<keyof S, OptionalKeys<S>>;

/** Turns `{ a: UdidiSchema<X>; b: UdidiSchema<Y> }`
    into `{ a: X; b: Y }`  */
export type OutputOfShape<S extends Shape> =
  // required part
  {
    [K in RequiredKeys<S>]: Exclude<SchemaOf<S[K]>, undefined>;
  } & { [K in OptionalKeys<S>]?: Exclude<SchemaOf<S[K]>, undefined> }; // optional part

export type MakeOptional<T> = { [K in keyof T]?: T[K] };
export type Expand<T> = T extends any[]
  ? T
  : T extends (...args: any) => any
    ? T
    : T extends Promise<any>
      ? T
      : T extends Set<any> | Map<any, any>
        ? T
        : T extends object
          ? { [K in keyof T]: T[K] }
          : T;

export type SafeParseObjectType = {
  success: boolean;
  data: unknown;
  errors: string[];
};

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type IntersectionOf<S extends any[]> = UnionToIntersection<S[number]>;

export type StrictRule = { $strict: boolean };

// Utility type to infer TypeScript types from schema trees
export type InferFromTree<S> = S extends {
  $or: infer U extends UdidiSchemaType[];
}
  ? InferFromTree<U[number]>
  : S extends { $and: infer U extends UdidiSchemaType[] }
    ? IntersectionOf<{ [K in keyof U]: InferFromTree<U[K]> }>
    : S extends { $not: any }
      ? never
      : S extends { $isType: "Number" | "Float" | "Integer" | "NumberLike" }
        ? number
        : S extends { $isType: "String" }
          ? string
          : S extends { $isType: "Boolean" }
            ? boolean
            : S extends { $isType: "BigInt" }
              ? bigint
              : S extends { $isType: "Symbol" }
                ? symbol
                : S extends { $isType: "Null" }
                  ? null
                  : S extends { $isType: "Undefined" }
                    ? undefined
                    : S extends { $isType: "Array"; $every: infer T }
                      ? InferFromTree<T>[]
                      : S extends { $isType: "Set"; $setOf: infer T }
                        ? Set<InferFromTree<T>>
                        : S extends {
                              $isType: "Map";
                              $entries: [infer K, infer V];
                            }
                          ? Map<InferFromTree<K>, InferFromTree<V>>
                          : S extends {
                                $isType: "TypedArray" | TypedArrayNames;
                              }
                            ? TypedArray
                            : S extends { $isType: "Object"; $props: infer P }
                              ? { [K in keyof P]: InferFromTree<P[K]> }
                              : unknown;
