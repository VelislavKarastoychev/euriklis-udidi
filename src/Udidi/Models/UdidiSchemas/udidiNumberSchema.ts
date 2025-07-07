"use strict";

import { UdidiSchema } from "./udidiSchema";

export class UdidiNumberSchema extends UdidiSchema<number> {
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
