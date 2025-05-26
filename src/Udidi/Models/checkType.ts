"use strict";
/**
 * Utility function which is used in series of methods to check if a variable is of a given type or instance.
 * @param {any} value - the current validator "value" property.
 * @returns {boolean} if the "value" is instance of the "type", then returns true, otherwise returns false.
 */
export const checkType = (value: any, type: string): boolean =>
  Object.prototype.toString.call(value) === `[object ${type}]`;
