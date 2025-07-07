"use strict";

import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";

export class UdidiFloat32ArraySchema extends UdidiTypedArraySchema<Float32Array> {
  constructor() {
    super("Float32Array");
  }
}
