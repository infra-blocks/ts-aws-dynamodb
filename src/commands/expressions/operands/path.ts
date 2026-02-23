import { type Brand, trusted } from "@infra-blocks/types";
import {
  type AttributeName,
  type AttributePath,
  isAttributePath,
} from "../../../types.js";
import {
  ExpressionFormatter,
  isExpressionFormatter,
  type PathFormatter,
} from "../formatter.js";

/**
 * This type represents the types that can implicitly be used
 * as path operands.
 */
export type ImplicitPath = AttributePath;

/**
 * This type aggregates the types that can be used as path operands.
 *
 * An {@link ImplicitPath} can be used in APIs that expect a {@link PathInput}
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
export type PathInput = AttributePath | Path;

export type Path = PathFormatter & Brand<"Path"> & { type: "Path" };

// TODO: don't export passed commands/index.ts
export const Path = {
  from(path: AttributePath, options?: { literal?: true }): Path {
    const { literal = false } = options ?? {};
    return trusted({
      type: "Path",
      ...ExpressionFormatter.from(({ names }) =>
        names.substitute(path, { literal }),
      ),
    });
  },
  normalize(input: PathInput): Path {
    if (isPath(input)) {
      return input;
    }
    return Path.from(input);
  },
};

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
 * A type guard to assess if something is a {@link PathInput}.
 *
 * @param value - The operand to test.
 *
 * @returns Whether the operand is a {@link PathInput}.
 */
export function isPathInput(value: unknown): value is PathInput {
  return isImplicitPath(value) || isPath(value);
}

function isImplicitPath(operand: unknown): operand is ImplicitPath {
  return isAttributePath(operand);
}

export function isPath(operand: unknown): operand is Path {
  return (
    isExpressionFormatter(operand) &&
    "type" in operand &&
    operand.type === "Path"
  );
}
