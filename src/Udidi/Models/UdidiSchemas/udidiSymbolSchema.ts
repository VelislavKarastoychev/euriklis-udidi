"use strict";

import { UdidiSchema } from "./udidiSchema";

export class UdidiSymbolSchema extends UdidiSchema<symbol> {
  constructor() {
    super({ $isType: "Symbol" });
  }

  hasDescription(description: string | RegExp): this {
    return this.update({ $hasDescription: description });
  }

  inGlobalRegistry(): this {
    return this.update({ $global: true });
  }
  notInGlobalRegistry(): this {
    return this.update({ $global: false });
  }

  keyIs(key: string): this {
    return this.update({ $globalKey: key });
  }

  isWellKnown(): this {
    return this.update({ $wellKnown: true });
  }
}
