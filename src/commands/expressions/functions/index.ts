import type { AttributeExists } from "./attribute-exists.js";
import type { AttributeNotExists } from "./attribute-not-exists.js";
import type { IsAttributeOfType } from "./attribute-type.js";
import type { BeginsWith } from "./begins-with.js";
import type { Contains } from "./contains.js";

export * from "./attribute-exists.js";
export * from "./attribute-not-exists.js";
export * from "./attribute-type.js";
export * from "./begins-with.js";
export * from "./contains.js";

/**
 * A grouping of all function expressions.
 */
export type FunctionExpression =
  | AttributeExists
  | AttributeNotExists
  | IsAttributeOfType
  | BeginsWith
  | Contains;
