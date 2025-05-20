// Types/index.ts

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

export type UdidiTypes =
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
export type IsType = {
  $isType: UdidiTypes;
  $any?: UdidiSchemaType;
  $every?: UdidiSchemaType;
};
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

export type LOGICAL_EXPRESSIONS =
  | GreaterThan
  | GreaterThanOrEqual
  | LessThan
  | LessThanOrEqual
  | SameAs
  | IsType
  | NotEqualsTo
  | HasLength
  | HasLengthLessThan
  | HasLengthGreaterThan
  | HasLengthInRange
  | InRange
  | MatchesRegex;

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
