"use strict";
import { type Integer } from "../../../Types";

export const IncorrectRangeInterval = (x: Integer, y: Integer): string =>
  `Invalid range interval (${x}, ${y}). The first integer has to be less than or equal to the second.`;
