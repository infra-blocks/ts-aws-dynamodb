import { isString } from "@infra-blocks/types";
import type { AttributePath } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { IOperand } from "./interface.js";

/**
 * This type regroups the types that are considered path operands by default.
 *
 * It includes the proper typed value, the {@link AttributePath}, but also
 * includes {@link AttributePath} as a loose type. The native scalar string
 * is considered a path operand by default.
 */
export type LoosePathOperand = AttributePath | PathOperand;

export type PathOperandParams = LoosePathOperand; // They are the same here.

/**
 * Represents an attribute path operand in an expression.
 *
 * When this operand is stringified, it first registers the
 * attribute name in the {@link AttributeNames} registry and substitutes
 * it with the returned value.
 */
export class PathOperand implements IOperand {
  private readonly path: AttributePath;

  private constructor(path: AttributePath) {
    this.path = path;
  }

  substitute(params: { names: AttributeNames }): string {
    const { names } = params;
    return names.substitute(this.path);
  }

  /**
   * @private
   */
  static from(path: AttributePath): PathOperand {
    return new PathOperand(path);
  }
}

/**
 * This function transforms a loose path operand into a strict {@link PathOperand}.
 *
 * @param path - The path of the attribute this operand represents. If it is a string,
 * then it is converted to a {@link PathOperand}. If it is already a {@link PathOperand},
 * then it is returned as is.
 *
 * @returns The corresponding {@link PathOperand} instance for the provided path.
 */
export function path(path: PathOperandParams): PathOperand {
  if (isPathOperand(path)) {
    return path;
  }
  return PathOperand.from(path as AttributePath);
}

/**
 * A type guard for detecting loose path operands.
 *
 * @param value - The value to check.
 *
 * @returns True if the operand is a loose path operand, false otherwise.
 */
export function isLoosePathOperand(value: unknown): value is LoosePathOperand {
  return isString(value) || isPathOperand(value);
}

/**
 * A type guard for detecting path operands.
 *
 * @param value - The value to check.
 *
 * @returns True if the operand is a path operand, false otherwise.
 */
export function isPathOperand(value: unknown): value is PathOperand {
  return value instanceof PathOperand;
}
