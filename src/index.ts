import type { Integer } from "../Types";
import * as models from "./Models";

export class UdidiClient {
  private _host: string = "localhost";
  private _port: Integer = 2712;
  private _database: string = "";
  constructor({
    host = "localhost",
    port = 2712,
    database = "",
  }: {
    host?: string;
    port?: Integer;
    database?: string;
  } = {}) {
    this.host = host;
    this.port = port;
    this.database = database;
  }

  get host(): string {
    return this._host;
  }

  set host(host: string) {
    this._host = host;
  }

  get port(): Integer {
    return this._port;
  }

  set port(port: Integer) {
    this._port = port;
  }

  get database(): string {
    return this._database;
  }

  set database(db: string) {
    this._database = db;
  }
  checkConnection(): boolean {
    return models.CheckConnection(this.host, this.port);
  }
}

