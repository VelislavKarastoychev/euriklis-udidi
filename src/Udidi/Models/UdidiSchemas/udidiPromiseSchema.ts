"use strict";

import type { Udidi } from "../..";
import { UdidiSchema } from "./udidiSchema";

export class UdidiPromiseSchema<T = unknown> extends UdidiSchema<Promise<T>> {
  constructor() {
    super({ $isType: "Promise" });
  }

  returns<S extends UdidiSchema<any>>(
    u: S,
  ): UdidiPromiseSchema<Udidi.Infer<S>> {
    this.update({ $returns: u.schema });
    return this as unknown as UdidiPromiseSchema<Udidi.Infer<S>>;
  }
}
