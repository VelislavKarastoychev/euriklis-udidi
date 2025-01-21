"use strict";
import message from "@euriklis/message-ts";
import net from "net";
import type { Integer } from "../../Types";

export const CheckConnection = (host: string, port: Integer): boolean => {
  let success: boolean = false;
  const client = net.createConnection({ host, port }, (): void => {
    const url = `udidi://${host}:${port}`;
    client.write(url);
    client.on("data", (data: Buffer): void => {
      new message().append(data.toString()).log();
      client.end();
      success = true;
    });
  });
  client.on("error", (): void => {
    new message().setColorRed.appendNotCheckMark
      .appendWhiteSpace()
      .setColorCyan.append("Something went wrong!")
      .log();
    success = false;
  });

  return success;
};
