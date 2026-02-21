import {
  type AttributeName,
  type AttributePath,
  isNativeString,
} from "../../../types.js";
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
  private readonly literal: boolean;

  private constructor(params: { path: AttributePath; literal: boolean }) {
    const { path, literal } = params;
    this.path = path;
    this.literal = literal;
  }

  substitute(params: { names: AttributeNames }): string {
    const { names } = params;
    return names.substitute(this.path, { literal: this.literal });
  }

  /**
   * @private
   */
  static from(path: AttributePath, options?: { literal?: true }): Path {
    const { literal = false } = options ?? {};
    return new Path({ path, literal });
  }

  /**
   * Turns {@link RawPath} path into a {@link Path} instance.
   *
   * If the provided path is already a {@link Path}, it will be returned as-is.
   * Otherwise, a new {@link Path} instance will be created from the provided
   * argument.
   *
   * @param raw - The path to return as is or convert to a {@link Path} instance.
   *
   * @returns The normalized {@link Path} instance.
   *
   * @private
   */
  static normalize(raw: RawPath): Path {
    if (raw instanceof Path) {
      return raw;
    }
    return Path.from(raw);
  }
}

/**
 * Factory function to create a {@link Path}.
 *
 * Client code can use this function to disambiguate the expression.
 * Normally, strings are treated as paths by default in expression constructs,
 * but it can be clearer to write something like `set(path("toto"), path("tata"))`
 * instead of `set("toto", "tata")`, for example.
 *
 * @param path - The path of the attribute this operand represents.
 *
 * @returns A new {@link Path} instance for the provided path.
 */
export function path(path: AttributePath): Path {
  return Path.from(path);
}

/**
 * Factory function to create a literal {@link Path}.
 *
 * A literal path does not get parsed before being stringified into an expression
 * attribute name. It is simply used as is. For example, if the name of
 * an attribute contains a dot, such as "not.a.good.idea", then the client code
 * *must* use a {@link literal} to translate it as the following attribute names:
 * {
 *  "#attr1": "not.a.good.idea"
 * }
 * Instead of the default of:
 * {
 *  "#attr1": "not",
 *  "#attr2": "a",
 *  "#attr3": "good",
 *  "#attr4": "idea"
 * }
 *
 * @param name - The attribute name, taken literally.
 * @returns A new literal {@link Path} instance for the provided name.
 */
export function literal(name: AttributeName): Path {
  return Path.from(name, { literal: true });
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
