"use strict";

import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";

export class UdidiInt8ArraySchema extends UdidiTypedArraySchema<Int8Array> {
  constructor() {
    super("Int8Array");
  }
}
