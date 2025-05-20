// src/Models/TestConnection.ts
"use strict";
import type { Integer, UdidiResponseType } from "../../Types";
import type { Socket } from "bun";

export const TestConnection = (
  hostname: string,
  port: Integer,
  database: string,
): Promise<UdidiResponseType> => {
  return new Promise(
    (
      resolve: (response: UdidiResponseType) => void,
      reject: (reason: UdidiResponseType) => void,
    ): void => {
      try {
        Bun.connect({
          hostname,
          port,
          socket: {
            open(socket: Socket): void {
              try {
                const url: string = database
                  ? `udidi://${hostname}:${port}/${database}?request="{"action":"test"}"`
                  : `udidi://${hostname}:${port}?request="{"action":"test"}"`;
                socket.write(url);
              } catch (error) {
                const response: UdidiResponseType = {
                  success: false,
                  data: null,
                  database,
                  message: (error as Error).message,
                };
                socket.end();
                reject(response);
              }
            },
            data(socket: Socket, data: Buffer): void {
              try {
                const response: UdidiResponseType = JSON.parse(data.toString());
                if (response.success) {
                  resolve(response);
                } else reject(response);
                socket.end();
              } catch (error) {
                const response: UdidiResponseType = {
                  database,
                  data: null,
                  success: false,
                  message: (error as Error).message,
                };
                reject(response);
              }
            },
            error(socket: Socket, error: Error): void {
              const response: UdidiResponseType = {
                success: false,
                message: (error as Error).message,
                database,
                data: null,
              };
              socket.end();

              reject(response);
            },
            connectError(socket: Socket, error: Error): void {
              socket.end();
              reject({
                success: false,
                data: null,
                database,
                message: error.message,
              });
            },
          },
        });
      } catch (error) {
        const response: UdidiResponseType = {
          success: false,
          message: (error as Error).message,
          data: null,
          database,
        };
        reject(response);
      }
    },
  );
};
