"use strict";

import { UdidiSchema } from "./udidiSchema";

export class UdidiEnumSchema<T extends string | number> extends UdidiSchema<T> {
  constructor(values: readonly T[]) {
    super({ $enum: values });
  }
}
