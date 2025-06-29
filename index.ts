"use strict";

import { Udidi } from "./src/Udidi";

const asyncFunctionSchema = Udidi.async().returns(Udidi.number());

const promiseSchema = Udidi.promise().returns(Udidi.number());
type promiseType = Udidi.Infer<typeof promiseSchema>;

type asyncType = Udidi.Infer<typeof asyncFunctionSchema>;

const symbolSchema = Udidi.symbol();
type symbolType = Udidi.Infer<typeof symbolSchema>;

symbolSchema.safeParse(Symbol("aSymbolTest"));

export const checkType = (value: any, type: string): boolean =>
  Object.prototype.toString.call(value) === `[object ${type}]`;

const f = async (): Promise<number> => {
  return 0;
};

const funcSchema = Udidi.function().returns(Udidi.array(Udidi.string()));
type functionType = Udidi.Infer<typeof funcSchema>;

const p = new Promise(() => {});

console.log(checkType(f, "AsyncFunction"));
console.log(checkType(p, "Promise"));
