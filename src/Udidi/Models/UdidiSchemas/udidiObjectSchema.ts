"use strict";

import type { Shape, OutputOfShape, UdidiSchemaType } from "../../../../Types";
import { UdidiSchema } from "./udidiSchema";

export class UdidiObjectSchema<S extends Shape = {}> extends UdidiSchema<
  OutputOfShape<S>
> {
  private _shape: S;
  private static propsTree(shape: Shape): UdidiSchemaType {
    const props: Record<string, UdidiSchemaType> = {};
    for (const k in shape) props[k] = shape[k].schema;
    return { $isType: "Object", $props: props } as unknown as UdidiSchemaType;
  }

  constructor(shape: S = {} as S) {
    super(UdidiObjectSchema.propsTree(shape));
    this._shape = shape;
  }

  get shape(): S {
    return this._shape;
  }

  extend<T extends Shape>(extra: T): UdidiObjectSchema<S & T> {
    return new UdidiObjectSchema({ ...this._shape, ...extra });
  }

  pick<K extends keyof S>(...keys: K[]): UdidiObjectSchema<Pick<S, K>> {
    const subset: Partial<S> = {};
    keys.forEach((k) => {
      subset[k] = this._shape[k];
    });
    return new UdidiObjectSchema(subset as Pick<S, K>);
  }

  // partial(): UdidiObjectSchema<{ [K in keyof S]?: S[K] }> {
  //   // runtime: mark props optional
  //   const tree = { ...this.schema, $optional: Object.keys(this._shape) };
  //   const out = new UdidiObjectSchema(this._shape) as any;
  //   out.schema = tree;
  //   return out;
  // }
}
