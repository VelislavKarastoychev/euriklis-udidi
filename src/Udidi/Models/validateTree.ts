import { KNOWN_KEYS } from "./knownKeys";
export function validateTree(tree: any): void {
  if (typeof tree !== "object" || tree === null)
    throw new Error("Invalid schema: expected object");
  for (const key of Object.keys(tree)) {
    if (!KNOWN_KEYS.has(key)) {
      throw new Error(`Invalid schema key ${key}`);
    }
    const val = (tree as any)[key];
    if (key === "$or" || key === "$and") {
      if (!Array.isArray(val)) throw new Error(`Expected array for ${key}`);
      val.forEach(validateTree);
    } else if (key === "$not") {
      validateTree(val);
    } else if (key === "$props") {
      if (typeof val !== "object" || val === null)
        throw new Error("Invalid $props value");
      for (const k in val) validateTree(val[k]);
    } else if (key === "$entries") {
      if (!Array.isArray(val) || val.length !== 2)
        throw new Error("$entries must be tuple");
      validateTree(val[0]);
      validateTree(val[1]);
    } else if (
      key === "$every" ||
      key === "$setOf" ||
      key === "$any" ||
      key === "$returns"
    ) {
      validateTree(val);
    }
  }
}
