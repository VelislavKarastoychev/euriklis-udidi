"use strict";

import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";

export class UdidiFloat64ArraySchema extends UdidiTypedArraySchema<Float64Array> {
  constructor() {
    super("Float64Array");
  }
}
