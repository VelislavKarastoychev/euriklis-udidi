// src/udidi-client.ts
"use strict";

import type { Integer, UdidiProtocolType, UdidiResponseType } from "../Types";
import * as models from "./Models";

export class UdidiClient {
  private _host: string = "localhost";
  private _port: Integer = 2712;
  private _database: string = "";
  private _request: UdidiProtocolType = {
    action: "test",
    query: {},
    options: {},
  };

  /**
   * Creates an instance of the
   * UdidiClient class.
   * Allows specifying the database
   * server's host, port, and name.
   *
   * @param {Object} [options] - Optional parameters
   * for the UdidiClient instance.
   * @param {string} [options.host="localhost"] - The
   * host address of the database server.
   * @param {Integer} [options.port=2712] - The port
   * number of the database server.
   * @param {string} [options.database=""] - The name
   * of the database to connect to.
   */
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

  /**
   * Retruns the HOST value of the current
   * database instance.
   * @returns {string} The host name of the
   * database server. By default this value is
   * set to "localhost".
   */
  get host(): string {
    return this._host;
  }

  /**
   * @param {string} host - The host
   * value of the database server
   * for the current instance.
   */
  set host(host: string) {
    this._host = host;
  }

  /**
   * @returns {Integer} - The port of the
   * current database server instance.
   */
  get port(): Integer {
    return this._port;
  }

  /**
   * @param {Integer} port - sets the port
   * of the current database instance.
   */
  set port(port: Integer) {
    this._port = port;
  }

  /**
   * Getter which returns the database name
   * for the current udidi instance.
   * @returns {string} The current database name
   * defined for this udidi instance.
   * By default the database value is set to
   * an empty string.
   */
  get database(): string {
    return this._database;
  }

  /**
   * Sets the name of the database for the
   * current udidi instance.
   *
   * @param {string} db - The name of the database.
   */
  set database(db: string) {
    this._database = db;
  }

  get request(): UdidiProtocolType {
    return this._request;
  }

  set request(req: UdidiProtocolType) {
    this._request = req;
  }

  /**
   * Tests if the connection with this ddatabase
   * is possible.
   * - If the database server is not loaded
   *   then the method will return false.
   * - If database which is defined for the
   *   instance does not exist, then the
   *   method will return false.
   *  - If the port or the host name of the
   *  database are changed in the configuration
   *  file then the method will return false.
   *
   * @return {Promise<UdidiResponseType>} true if the connection
   * with the database is correct and false otherwise.
   */
  async testConnection(): Promise<UdidiResponseType> {
    try {
      return await models.TestConnection(this.host, this.port, this.database);
    } catch (reject) {
      return reject as UdidiResponseType;
    }
  }

  async dbConnect(): Promise<UdidiResponseType> {
    // to be implemented...
    return {
      success: true,
      message: "",
      database: "",
      data: "",
    };
  }
}
