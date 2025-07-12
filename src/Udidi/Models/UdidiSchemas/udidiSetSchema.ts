"use strict";

import * as errors from "../../Errors";
import type {
  Integer,
  SchemaOf,
  AnyUdidiSchema,
  UdidiSchemaType,
} from "../../../../Types";
import { UdidiSchema } from "./udidiSchema";

export class UdidiSetSchema<E = unknown> extends UdidiSchema<Set<E>> {
  constructor(member: AnyUdidiSchema = new UdidiSchema()) {
    const setTree = {
      $isType: "Set",
      $setOf: member.schema,
    } as UdidiSchemaType;
    const isNullable =
      (member.schema as any).$isType === "Null" ||
      (Array.isArray((member.schema as any).$or) &&
        (member.schema as any).$or.some((s: any) => s.$isType === "Null"));
    super(isNullable ? { $or: [setTree, { $isType: "Null" }] } : setTree);
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
