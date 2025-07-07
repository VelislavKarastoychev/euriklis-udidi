"use strict";

import * as errors from "../../Errors";
import type { AnyUdidiSchema, SchemaOf, Integer } from "../../../../Types";
import { UdidiSchema } from "./udidiSchema";

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
