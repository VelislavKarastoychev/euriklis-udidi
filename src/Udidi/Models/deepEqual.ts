"use strict";

export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    const arrA = a as any;
    const arrB = b as any;
    if (arrA.constructor !== arrB.constructor || arrA.length !== arrB.length)
      return false;
    for (let i = 0; i < arrA.length; i++) {
      if (arrA[i] !== arrB[i]) return false;
    }
    return true;
  }

  if (a instanceof ArrayBuffer && b instanceof ArrayBuffer) {
    if (a.byteLength !== b.byteLength) return false;
    const viewA = new Uint8Array(a);
    const viewB = new Uint8Array(b);
    for (let i = 0; i < viewA.length; i++) {
      if (viewA[i] !== viewB[i]) return false;
    }
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const k of keysA) {
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }

  return false;
};
