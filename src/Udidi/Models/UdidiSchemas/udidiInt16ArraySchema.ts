"use strict";

import { UdidiTypedArraySchema } from "./udidiTypedArraySchema";

export class UdidiInt16ArraySchema extends UdidiTypedArraySchema<Int16Array> {
  constructor() {
    super("Int16Array");
  }
}
