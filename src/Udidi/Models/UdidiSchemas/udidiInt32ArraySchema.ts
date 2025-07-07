"use strict";

import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";

export class UdidiInt32ArraySchema extends UdidiTypedArraySchema<Int32Array> {
  constructor() {
    super("Int32Array");
  }
}
