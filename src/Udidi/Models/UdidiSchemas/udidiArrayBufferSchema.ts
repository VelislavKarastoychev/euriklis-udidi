"use strict";

import { UdidiSchema } from "./udidiSchema";

export class UdidiArrayBufferSchema extends UdidiSchema<ArrayBuffer> {
  constructor() {
    super({ $isType: "ArrayBuffer" });
  }
}
