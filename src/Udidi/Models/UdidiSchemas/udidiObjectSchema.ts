"use strict";

import type {
  Shape,
  OutputOfShape,
  UdidiSchemaType,
  AnyUdidiSchema,
} from "../../../../Types";
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

  merge<T extends Shape>(
    other: UdidiObjectSchema<T>,
  ): UdidiObjectSchema<S & T> {
    const mergedShape = { ...this._shape, ...other.shape } as S & T;
    const merged = new UdidiObjectSchema<S & T>(mergedShape);
    const thisTree = this.schema as any;
    const otherTree = other.schema as any;
    merged.schema = {
      ...thisTree,
      ...otherTree,
      $props: { ...(thisTree.$props || {}), ...(otherTree.$props || {}) },
    } as UdidiSchemaType;
    return merged;
  }

  pick<K extends keyof S>(...keys: K[]): UdidiObjectSchema<Pick<S, K>> {
    const subset: Partial<S> = {};
    keys.forEach((k) => {
      subset[k] = this._shape[k];
    });
    return new UdidiObjectSchema(subset as Pick<S, K>);
  }

  partial(): UdidiObjectSchema<{
    [K in keyof S]: ReturnType<S[K]["optional"]>;
  }> {
    const optShape: Partial<Record<keyof S, AnyUdidiSchema>> = {};
    for (const k in this._shape) {
      optShape[k] = this._shape[k].optional();
    }
    return new UdidiObjectSchema(
      optShape as {
        [K in keyof S]: ReturnType<S[K]["optional"]>;
      },
    );
  }

  strict(): this {
    return this.update({ $strict: true });
  }

  passthrough(): this {
    return this.update({ $strict: false });
  }
}
