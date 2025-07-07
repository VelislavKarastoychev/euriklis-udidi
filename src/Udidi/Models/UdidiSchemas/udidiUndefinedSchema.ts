"use strict";

import { UdidiSchema } from "./udidiSchema";

export class UdidiUndefinedSchema extends UdidiSchema<undefined> {
  constructor() {
    super({ $isType: "Undefined" });
  }
}
