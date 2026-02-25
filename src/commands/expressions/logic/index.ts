import type { And } from "./and.js";
import type { Not } from "./not.js";
import type { Or } from "./or.js";

export * from "./and.js";
export * from "./not.js";
export * from "./or.js";

/**
 * A grouping of all logic expression.
 */
export type Logic = And | Or | Not;
