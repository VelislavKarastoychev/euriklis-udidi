"use strict";

import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";

export class UdidiUint32ArraySchema extends UdidiTypedArraySchema<Uint32Array> {
  constructor() {
    super("Uint32Array");
  }
}
