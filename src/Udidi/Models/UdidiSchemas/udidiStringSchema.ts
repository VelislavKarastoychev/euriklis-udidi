"use strict";

import * as errors from "../../Errors";
import { UdidiSchema } from "./udidiSchema";
import type { Integer } from "../../../../Types";

export class UdidiStringSchema extends UdidiSchema<string> {
  constructor() {
    super({ $isType: "String" });
  }

  hasLength(n: Integer): UdidiStringSchema {
    return this.update({ $hasLength: n });
  }

  hasLengthLessThan(n: Integer): UdidiStringSchema {
    return this.update({ $hasLengthLessThan: n });
  }
  hasLengthGreaterThan(n: Integer): UdidiStringSchema {
    return this.update({ $hasLengthGreaterThan: n });
  }

  hasLengthInRange(m: Integer, n: Integer): this {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $range: [m, n] });
  }

  hasLengthInClosedRange(m: Integer, n: Integer): this {
    if (m > n) throw new Error(errors.IncorrectRangeInterval(m, n));
    return this.update({ $closedRange: [m, n] });
  }

  match(regex: RegExp): this {
    return this.update({ $match: regex });
  }

  email(options?: { domain?: string }): this {
    return this.update({ $email: options ?? true });
  }

  url(options?: { hostname?: string; protocol?: string }): this {
    return this.update({ $url: options ?? true });
  }

  trim(): this {
    return this.update({ $trim: true });
  }

  toLowerCase(): this {
    return this.update({ $toLowerCase: true });
  }

  toUpperCase(): this {
    return this.update({ $toUpperCase: true });
  }

  uuid(options?: { version?: "v1" | "v2" | "v3" | "v4" | "v5" }): this {
    return this.update({ $uuid: options ?? true });
  }

  emoji(): this {
    return this.update({ $emoji: true });
  }

  base64(): this {
    return this.update({ $base64: true });
  }

  base64url(): this {
    return this.update({ $base64url: true });
  }

  nanoid(): this {
    return this.update({ $nanoid: true });
  }

  cuid(): this {
    return this.update({ $cuid: true });
  }

  cuid2(): this {
    return this.update({ $cuid2: true });
  }

  ulid(): this {
    return this.update({ $ulid: true });
  }

  ipv4(): this {
    return this.update({ $ipv4: true });
  }

  ipv6(): this {
    return this.update({ $ipv6: true });
  }

  cidrv4(): this {
    return this.update({ $cidrv4: true });
  }

  cidrv6(): this {
    return this.update({ $cidrv6: true });
  }

  get iso() {
    return {
      date: () => this.update({ $isodate: true }),
      time: () => this.update({ $isotime: true }),
      datetime: () => this.update({ $isodatetime: true }),
      duration: () => this.update({ $isoduration: true }),
    };
  }
}
