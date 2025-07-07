"use strict";
import { Udidi } from "../..";
import { UdidiSchema } from "./udidiSchema";

export class UdidiAsyncFunctionSchema<T = unknown> extends UdidiSchema<
  () => Promise<T>
> {
  constructor() {
    super({ $isType: "AsyncFunction" });
  }

  returns<S extends UdidiSchema<any>>(
    u: S,
  ): UdidiAsyncFunctionSchema<Udidi.Infer<S>> {
    this.update({ $returns: u.schema });
    return this as unknown as UdidiAsyncFunctionSchema<Udidi.Infer<S>>;
  }
}
