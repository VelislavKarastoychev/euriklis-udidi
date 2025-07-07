"use strict";

import { UdidiSchema } from "./udidiSchema";

export class UdidiBooleanSchema extends UdidiSchema<boolean> {
  constructor() {
    super({ $isType: "Boolean" });
  }

  true(): UdidiBooleanSchema {
    return this.update({ $same: true });
  }

  false(): UdidiBooleanSchema {
    return this.update({ $same: false });
  }
}
