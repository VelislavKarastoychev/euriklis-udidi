import type {
  AnyUdidiSchema,
  InstanceFromTree,
  UdidiSchemaType,
} from "../../../Types";
import {
  UdidiArrayBufferSchema,
  UdidiArraySchema,
  UdidiAsyncFunctionSchema,
  UdidiBigIntSchema,
  UdidiBooleanSchema,
  UdidiFunctionSchema,
  UdidiMapSchema,
  UdidiNullSchema,
  UdidiNumberSchema,
  UdidiObjectSchema,
  UdidiPromiseSchema,
  UdidiSchema,
  UdidiSetSchema,
  UdidiStringSchema,
  UdidiSymbolSchema,
  UdidiTypedArraySchema,
  UdidiUndefinedSchema,
} from "./UdidiSchemas";
import { validateTree } from "./validateTree";
export function buildFromTree<const S extends UdidiSchemaType>(
  tree: S,
): InstanceFromTree<S> {
  validateTree(tree);
  const type = (tree as any).$isType as string | undefined;
  let schema: AnyUdidiSchema;
  switch (type) {
    case "String":
      schema = new UdidiStringSchema();
      break;
    case "Number":
    case "Float":
    case "Integer":
    case "NumberLike":
    case "NaN":
      schema = new UdidiNumberSchema();
      break;
    case "Boolean":
      schema = new UdidiBooleanSchema();
      break;
    case "BigInt":
      schema = new UdidiBigIntSchema();
      break;
    case "Symbol":
      schema = new UdidiSymbolSchema();
      break;
    case "Null":
      schema = new UdidiNullSchema();
      break;
    case "Undefined":
      schema = new UdidiUndefinedSchema();
      break;
    case "Array":
      schema = new UdidiArraySchema(buildFromTree((tree as any).$every ?? {}));
      break;
    case "Set":
      schema = new UdidiSetSchema(buildFromTree((tree as any).$setOf ?? {}));
      break;
    case "Map": {
      const [k, v] = (tree as any).$entries ?? [{}, {}];
      schema = new UdidiMapSchema(buildFromTree(k), buildFromTree(v));
      break;
    }
    case "Object": {
      const props = (tree as any).$props || {};
      const shape: Record<string, AnyUdidiSchema> = {};
      for (const key in props) shape[key] = buildFromTree(props[key]);
      schema = new UdidiObjectSchema(shape);
      break;
    }
    case "Function":
      schema = new UdidiFunctionSchema();
      break;
    case "AsyncFunction":
      schema = new UdidiAsyncFunctionSchema();
      break;
    case "Promise":
      schema = new UdidiPromiseSchema();
      break;
    case "TypedArray":
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
      schema = new UdidiTypedArraySchema(type as any);
      break;
    case "ArrayBuffer":
      schema = new UdidiArrayBufferSchema();
      break;
    default:
      schema = new UdidiSchema();
  }
  (schema as any).schema = tree;
  return schema as InstanceFromTree<S>;
}
