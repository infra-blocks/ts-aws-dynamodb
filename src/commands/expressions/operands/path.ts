import { type AttributePath, isNativeString } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { IOperand } from "./operand.js";

/**
 * This type represents the types that can implicitly be used
 * as path operands.
 */
export type ImplicitPath = AttributePath;

/**
 * This type aggregates the types that can be used as path operands.
 *
 * An {@link ImplicitPath} can be used in APIs that expect a {@link RawPath}
 * just as well as an explicit {@link Path} instance.
 *
 * Using the {@link attributeExists} function as example, the following two
 * invokations are equivalent:
 * ```ts
 * // Explicit path.
 * attributeExists(path("foo.bar.baz"));
 * // Implicit path.
 * attributeExists("foo.bar.baz");
 * ```
 */
export type RawPath = AttributePath | Path;

/**
 * Represents an attribute path operand in an expression.
 *
 * When this operand is stringified, it first registers the
 * attribute path in the {@link AttributeNames} registry and substitutes
 * it with the returned value.
 */
export class Path implements IOperand {
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
  static from(path: AttributePath): Path {
    return new Path(path);
  }

  /**
   * Turns {@link RawPath} path into a {@link Path} instance.
   *
   * If the provided path is already a {@link Path}, it will be returned as-is.
   * Otherwise, a new {@link Path} instance will be created from the provided
   * argument.
   *
   * @param loosePath - The path to return as is or convert to a {@link Path} instance.
   *
   * @returns The normalized {@link Path} instance.
   *
   * @private
   */
  static normalize(loosePath: RawPath): Path {
    if (loosePath instanceof Path) {
      return loosePath;
    }
    return Path.from(loosePath);
  }
}

/**
 * Factory function to create a {@link Path}.
 *
 * @param path - The path of the attribute this operand represents.
 *
 * @returns A new {@link Path} instance for the provided path.
 */
export function path(path: AttributePath): Path {
  return Path.from(path);
}

/**
 * A type guard to assess if something is a {@link RawPath}.
 *
 * @param operand - The operand to test.
 *
 * @returns Whether the operand is a {@link RawPath}.
 */
export function isRawPath(operand: unknown): operand is RawPath {
  return isImplicitPath(operand) || isPath(operand);
}

function isImplicitPath(operand: unknown): operand is ImplicitPath {
  return isNativeString(operand);
}

function isPath(operand: unknown): operand is Path {
  return operand instanceof Path;
}
