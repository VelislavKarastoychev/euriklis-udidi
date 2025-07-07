"use strict";

import * as errors from "../../Errors";
import { UdidiSchema } from "./udidiSchema";
import type {
  Integer,
  UdidiSchemaType,
  AnyUdidiSchema,
  SchemaOf,
} from "../../../../Types";

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
