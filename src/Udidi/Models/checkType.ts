"use strict";
/**
 * Utility function which is used in series of methods to check if a variable is of a given type or instance.
 * @param {any} value - the current "value" property.
 * @param {string} type - the type to be checked.
 * @returns {boolean} if the "value" is instance of the "type", then returns true, otherwise returns false.
 */

export const checkType = (value: any, type: string): boolean => {
  switch (type) {
    case "Integer":
      return typeof value === "number" && Number.isInteger(value);
    case "Float":
      return (
        typeof value === "number" &&
        !Number.isNaN(value) &&
        !Number.isInteger(value)
      );
    case "NaN":
      return Number.isNaN(value);
    case "TypedArray":
      return ArrayBuffer.isView(value) && !(value instanceof DataView);
    default:
      return Object.prototype.toString.call(value) === `[object ${type}]`;
  }
};
