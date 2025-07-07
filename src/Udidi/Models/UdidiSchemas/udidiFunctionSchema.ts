"use strict";

import { UdidiSchema } from "./udidiSchema";
import { Udidi } from "../..";

export class UdidiFunctionSchema<T = unknown> extends UdidiSchema<() => T> {
  constructor() {
    super({ $isType: "Function" });
  }

  returns<S extends UdidiSchema<unknown>>(
    u: S,
  ): UdidiFunctionSchema<Udidi.Infer<S>> {
    this.update({ $returns: u.schema });
    return this as unknown as UdidiFunctionSchema<Udidi.Infer<S>>;
  }
}
