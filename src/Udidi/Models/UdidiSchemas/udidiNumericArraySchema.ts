"use strict";
import { UdidiArraySchema } from "./udidiArraySchema";
import { Udidi } from "../..";

export class UdidiNumericArraySchema extends UdidiArraySchema<number> {
  constructor() {
    super(Udidi.number()); // delegate to generic array ctor
  }
}
