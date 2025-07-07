"use strict";

import * as errors from "../../Errors";
import { UdidiSchema } from "./udidiSchema";
import type { TypedArrayNames, TypedArray, Integer } from "../../../../Types";
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
