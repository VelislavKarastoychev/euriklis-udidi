"use strict";

import { UdidiSchema } from "./udidiSchema";

export class UdidiNullSchema extends UdidiSchema<null> {
  constructor() {
    super({ $isType: "Null" });
  }
}
