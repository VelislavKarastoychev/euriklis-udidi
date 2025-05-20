// src/udidi-agent.ts
"use strict";

import type { UdidiProtocolType, UdidiSchemaType } from "../Types";

export class UdidiAgent {
  private __PATH__: string = "";
  private __PROTOCOL__: UdidiProtocolType = {
    action: "read",
    query: {},
  };
  private __SCHEMA__: UdidiSchemaType = {};
  constructor({
    path,
    protocol,
    schema,
  }: {
    path?: string;
    protocol?: UdidiProtocolType;
    schema?: UdidiSchemaType;
  } = {}) {
    if (path) this.PATH = path;
    if (protocol) this.PROTOCOL = protocol;
    if (schema) this.SCHEMA = schema;
  }

  get PATH(): string {
    return this.__PATH__;
  }

  set PATH(path: string) {
    this.__PATH__ = path;
  }

  get PROTOCOL(): UdidiProtocolType {
    return this.__PROTOCOL__;
  }

  set PROTOCOL(protocol: UdidiProtocolType) {
    this.__PROTOCOL__ = protocol;
  }

  get SCHEMA(): UdidiSchemaType {
    return this.__SCHEMA__;
  }

  set SCHEMA(schema: UdidiSchemaType) {
    this.__SCHEMA__ = schema;
  }
}
