"use strict";

import { UdidiSchema } from "./udidiSchema";

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
