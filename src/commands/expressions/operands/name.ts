import type { AttributePath } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { IOperand } from "./type.js";

/**
 * Represents an attribute path operand in an expression.
 *
 * When this operand is stringified, it first registers the
 * attribute path in the {@link AttributeNames} registry and substitutes
 * it with the returned value.
 */
export class PathOperand implements IOperand {
  private readonly path: AttributePath;

  constructor(path: AttributePath) {
    this.path = path;
  }

  substitute(params: { names: AttributeNames }): string {
    const { names } = params;
    return names.substitute(this.path);
  }
}

/**
 * Factory function to create a {@link PathOperand}.
 *
 * @param path - The path of the attribute this operand represents.
 *
 * @returns A new {@link PathOperand} instance for the provided path.
 */
export function path(path: AttributePath): PathOperand {
  return new PathOperand(path);
}
