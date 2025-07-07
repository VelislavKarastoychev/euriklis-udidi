"use strict";
import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";
export class UdidiUint8ArraySchema extends UdidiTypedArraySchema<Uint8Array> {
  constructor() {
    super("Uint8Array");
  }
}
