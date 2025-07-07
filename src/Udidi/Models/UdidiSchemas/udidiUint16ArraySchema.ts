"use strict";

import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";

export class UdidiUint16ArraySchema extends UdidiTypedArraySchema<Uint16Array> {
  constructor() {
    super("Uint16Array");
  }
}
