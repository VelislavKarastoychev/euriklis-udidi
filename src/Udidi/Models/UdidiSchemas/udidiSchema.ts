"use strict";
import * as models from "../";
import type { UdidiSchemaType, SafeParseObjectType } from "../../../../Types";

declare function require(path: string): any;

const ipv6Regex = new RegExp(
  "^((?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4}){1,6}|:(?:(?::[0-9A-Fa-f]{1,4}){1,7}|:))$",
);
export class UdidiSchema<T = unknown> {
  private __SCHEMA__: UdidiSchemaType = {};
  private __DESCRIPTION__: string = "";
  constructor(schema: UdidiSchemaType = {}) {
    this.schema = schema;
  }

  get schema(): UdidiSchemaType {
    return this.__SCHEMA__;
  }

  set schema(schema: UdidiSchemaType) {
    this.__SCHEMA__ = schema;
  }

  set updateSchema(schema: UdidiSchemaType) {
    this.__SCHEMA__ = { ...this.__SCHEMA__, ...schema };
  }

  or<U>(other: UdidiSchema<U>): UdidiSchema<T | U> {
    const mergedSchema: UdidiSchemaType = { $or: [this.schema, other.schema] };
    return new UdidiSchema<T | U>(mergedSchema);
  }

  and<U>(other: UdidiSchema<U>): UdidiSchema<T & U> {
    const mergedSchema: UdidiSchemaType = {
      $and: [this.__SCHEMA__, other.schema],
    };
    return new UdidiSchema<T & U>(mergedSchema);
  }

  not<U>(schema: UdidiSchema<U>): UdidiSchema<T> {
    const negatedSchema: UdidiSchemaType = { $not: schema.schema };
    return new UdidiSchema<T>(negatedSchema);
  }

  protected update(obj: UdidiSchemaType): this {
    this.updateSchema = { ...this.updateSchema, ...obj };
    return this;
  }

  protected _clone<R extends UdidiSchema<unknown>>(): R {
    const c = Object.create(this.constructor.prototype);
    Object.assign(c, this);
    return c;
  }

  get serializedSchema(): string {
    const replacer = (_key: string, value: any): string => {
      if (value === Infinity) return "Infinity";
      if (value === -Infinity) return "-Infinity";
      if (typeof value === "function") return value.toString();
      if (Number.isNaN(value)) return "NaN";
      return value;
    };
    return JSON.stringify(
      { ...this.schema, $description: this.description },
      replacer,
    );
  }

  get description(): string {
    return this.__DESCRIPTION__;
  }

  set description(description: string) {
    this.__DESCRIPTION__ = description;
  }

  describe(description: string): this {
    this.description = description;
    return this;
  }

  optional(): this & UdidiSchema<T | undefined> {
    const clone = this._clone<this & UdidiSchema<T | undefined>>();
    clone.update({ $optional: true }); // ← store the flag in its own tree
    return clone;
  }

  nullable(): this & UdidiSchema<T | null> {
    const { UdidiNullSchema } = require("./udidiNullSchema");
    return this.or(new UdidiNullSchema()) as this & UdidiSchema<T | null>;
  }

  equals(item: T): this {
    return this.update({ $same: item });
  }

  safeParse(data: unknown): SafeParseObjectType {
    const errors: string[] = [];

    const validate = (value: any, schema: UdidiSchemaType): boolean => {
      if ((schema as any).$optional && value === undefined) return true;

      for (const key in schema) {
        const rule: any = (schema as any)[key];
        switch (key) {
          case "$and":
            return (rule as UdidiSchemaType[]).every((s) => validate(value, s));
          case "$or":
            return (rule as UdidiSchemaType[]).some((s) => validate(value, s));
          case "$not":
            return !validate(value, rule as UdidiSchemaType);
          case "$props":
            if (typeof value !== "object" || value === null) {
              errors.push("Expected object");
              return false;
            }
            for (const prop in rule) {
              if (!validate((value as any)[prop], rule[prop])) return false;
            }
            break;
          case "$every":
            if (!Array.isArray(value)) {
              errors.push("Expected array");
              return false;
            }
            for (const v of value) if (!validate(v, rule)) return false;
            break;
          case "$setOf":
            if (!(value instanceof Set)) {
              errors.push("Expected set");
              return false;
            }
            for (const v of value.values())
              if (!validate(v, rule)) return false;
            break;
          case "$entries":
            if (!(value instanceof Map)) {
              errors.push("Expected map");
              return false;
            }
            for (const [k, v] of value.entries()) {
              if (!validate(k, rule[0]) || !validate(v, rule[1])) return false;
            }
            break;
          case "$enum":
            if (!Array.isArray(rule) || !rule.includes(value)) {
              errors.push(`Expected one of ${rule.join(", ")}`);
              return false;
            }
            break;
          case "$isType":
            if (!models.checkType(value, rule)) {
              errors.push(`Expected type ${rule}`);
              return false;
            }
            break;
          case "$same":
            if (!models.deepEqual(value, rule)) {
              const repr =
                typeof rule === "object" ? JSON.stringify(rule) : String(rule);
              errors.push(`Expected ${repr}`);
              return false;
            }
            break;
          case "$lt":
            if (!(value < rule)) {
              errors.push(`Expected < ${rule}`);
              return false;
            }
            break;
          case "$gt":
            if (!(value > rule)) {
              errors.push(`Expected > ${rule}`);
              return false;
            }
            break;
          case "$leq":
            if (!(value <= rule)) {
              errors.push(`Expected <= ${rule}`);
              return false;
            }
            break;
          case "$geq":
            if (!(value >= rule)) {
              errors.push(`Expected >= ${rule}`);
              return false;
            }
            break;
          case "$neq":
            if (!(value !== rule)) {
              errors.push(`Expected != ${rule}`);
              return false;
            }
            break;
          case "$range":
            if (!(value >= rule[0] && value < rule[1])) {
              errors.push(`Expected in range [${rule[0]}, ${rule[1]})`);
              return false;
            }
            break;
          case "$closedRange":
            if (!(value >= rule[0] && value <= rule[1])) {
              errors.push(`Expected in range [${rule[0]}, ${rule[1]}]`);
              return false;
            }
            break;
          case "$hasLength": {
            const len = value?.length ?? value?.size;
            if (len !== rule) {
              errors.push(`Expected length ${rule}`);
              return false;
            }
            break;
          }
          case "$hasLengthLessThan": {
            const len = value?.length ?? value?.size;
            if (!(len < rule)) {
              errors.push(`Expected length < ${rule}`);
              return false;
            }
            break;
          }
          case "$hasLengthGreaterThan": {
            const len = value?.length ?? value?.size;
            if (!(len > rule)) {
              errors.push(`Expected length > ${rule}`);
              return false;
            }
            break;
          }
          case "$hasLengthInRange":
            if (
              !value ||
              !(value.length >= rule[0] && value.length < rule[1])
            ) {
              errors.push(`Expected length in range [${rule[0]}, ${rule[1]})`);
              return false;
            }
            break;
          case "$hasLengthInClosedRange": {
            const len = value?.length ?? value?.size;
            if (!(len >= rule[0] && len <= rule[1])) {
              errors.push(`Expected length in range [${rule[0]}, ${rule[1]}]`);
              return false;
            }
            break;
          }
          case "$match":
            if (typeof value !== "string" || !rule.test(value)) {
              errors.push(`Expected value to match ${rule}`);
              return false;
            }
            break;
          case "$email": {
            if (typeof value !== "string") {
              errors.push("Expected string");
              return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push("Expected valid email");
              return false;
            }
            if (rule !== true && typeof rule === "object" && rule.domain) {
              const domain = value.split("@")[1] || "";
              if (rule.domain instanceof RegExp) {
                if (!rule.domain.test(domain)) {
                  errors.push(`Expected email domain to match ${rule.domain}`);
                  return false;
                }
              } else if (domain !== rule.domain) {
                errors.push(`Expected email domain ${rule.domain}`);
                return false;
              }
            }
            break;
          }
          case "$url": {
            if (typeof value !== "string") {
              errors.push("Expected string");
              return false;
            }
            let parsed: URL;
            try {
              parsed = new URL(value);
            } catch {
              errors.push("Expected valid url");
              return false;
            }
            if (rule !== true && typeof rule === "object") {
              if (rule.hostname && parsed.hostname !== rule.hostname) {
                errors.push(`Expected hostname ${rule.hostname}`);
                return false;
              }
              if (
                rule.protocol &&
                parsed.protocol.replace(":", "") !==
                  rule.protocol.replace(":", "")
              ) {
                errors.push(`Expected protocol ${rule.protocol}`);
                return false;
              }
            }
            break;
          }
          case "$trim": {
            if (typeof value !== "string" || value.trim() !== value) {
              errors.push("Expected trimmed string");
              return false;
            }
            break;
          }
          case "$toLowerCase": {
            if (typeof value !== "string" || value !== value.toLowerCase()) {
              errors.push("Expected lower case string");
              return false;
            }
            break;
          }
          case "$toUpperCase": {
            if (typeof value !== "string" || value !== value.toUpperCase()) {
              errors.push("Expected upper case string");
              return false;
            }
            break;
          }
          case "$uuid": {
            if (typeof value !== "string") {
              errors.push("Expected string");
              return false;
            }
            const v =
              rule === true || !rule.version ? "[1-5]" : rule.version[1];
            const uuidRegex = new RegExp(
              `^[0-9a-f]{8}-[0-9a-f]{4}-${v}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`,
              "i",
            );
            if (!uuidRegex.test(value)) {
              errors.push("Expected valid uuid");
              return false;
            }
            break;
          }
          case "$emoji": {
            if (
              typeof value !== "string" ||
              !/\p{Extended_Pictographic}/u.test(value)
            ) {
              errors.push("Expected emoji");
              return false;
            }
            break;
          }
          case "$base64": {
            if (
              typeof value !== "string" ||
              !/^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(
                value,
              )
            ) {
              errors.push("Expected base64 string");
              return false;
            }
            break;
          }
          case "$base64url": {
            if (
              typeof value !== "string" ||
              !/^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2}==|[A-Za-z0-9_-]{3}=)?$/.test(
                value,
              )
            ) {
              errors.push("Expected base64url string");
              return false;
            }
            break;
          }
          case "$nanoid": {
            if (
              typeof value !== "string" ||
              !/^[A-Za-z0-9_-]{21}$/.test(value)
            ) {
              errors.push("Expected nanoid");
              return false;
            }
            break;
          }
          case "$cuid": {
            if (typeof value !== "string" || !/^c[^\s-]{8,}$/i.test(value)) {
              errors.push("Expected cuid");
              return false;
            }
            break;
          }
          case "$cuid2": {
            if (typeof value !== "string" || !/^[a-z0-9]{24}$/i.test(value)) {
              errors.push("Expected cuid2");
              return false;
            }
            break;
          }
          case "$ulid": {
            if (
              typeof value !== "string" ||
              !/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(value)
            ) {
              errors.push("Expected ulid");
              return false;
            }
            break;
          }
          case "$ipv4": {
            if (
              typeof value !== "string" ||
              !/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(
                value,
              )
            ) {
              errors.push("Expected ipv4");
              return false;
            }
            break;
          }
          case "$ipv6": {
            if (typeof value !== "string" || !ipv6Regex.test(value)) {
              errors.push("Expected ipv6");
              return false;
            }
            break;
          }
          case "$cidrv4": {
            if (typeof value !== "string") {
              errors.push("Expected string");
              return false;
            }
            const [ip, prefix] = value.split("/");
            if (
              !ip ||
              !/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(
                ip,
              ) ||
              isNaN(+prefix) ||
              +prefix < 0 ||
              +prefix > 32
            ) {
              errors.push("Expected cidr ipv4");
              return false;
            }
            break;
          }
          case "$cidrv6": {
            if (typeof value !== "string") {
              errors.push("Expected string");
              return false;
            }
            const [ip, prefix] = value.split("/");
            if (
              !ip ||
              !ipv6Regex.test(ip) ||
              isNaN(+prefix) ||
              +prefix < 0 ||
              +prefix > 128
            ) {
              errors.push("Expected cidr ipv6");
              return false;
            }
            break;
          }
          case "$isodate": {
            if (
              typeof value !== "string" ||
              !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
              isNaN(Date.parse(value))
            ) {
              errors.push("Expected ISO date");
              return false;
            }
            break;
          }
          case "$isotime": {
            if (
              typeof value !== "string" ||
              !/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?$/.test(
                value,
              )
            ) {
              errors.push("Expected ISO time");
              return false;
            }
            break;
          }
          case "$isodatetime": {
            if (
              typeof value !== "string" ||
              isNaN(Date.parse(value)) ||
              !/T/.test(value)
            ) {
              errors.push("Expected ISO datetime");
              return false;
            }
            break;
          }
          case "$isoduration": {
            if (
              typeof value !== "string" ||
              !/^P(?!$)(?:\d+(?:\.\d+)?Y)?(?:\d+(?:\.\d+)?M)?(?:\d+(?:\.\d+)?W)?(?:\d+(?:\.\d+)?D)?(?:T(?:\d+(?:\.\d+)?H)?(?:\d+(?:\.\d+)?M)?(?:\d+(?:\.\d+)?S)?)?$/.test(
                value,
              )
            ) {
              errors.push("Expected ISO duration");
              return false;
            }
            break;
          }
          default:
            break;
        }
      }
      return true;
    };
    const success = validate(data, this.schema);
    return {
      success,
      data: success ? data : undefined,
      errors,
    };
  }

  parse(data: unknown): T {
    const result = this.safeParse(data);
    if (!result.success) {
      throw new Error(result.errors.join("; "));
    }
    return result.data as T;
  }
}
