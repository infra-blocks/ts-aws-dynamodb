import type { AttributePath } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IOperand } from "./type.js";

/**
 * Represents an attribute by name operand in an expression.
 *
 * When this operand is stringified, it first registers the
 * attribute name in the {@link AttributeNames} registry and substitutes
 * it with the returned value.
 */
export class AttributeOperand implements IOperand {
  private readonly path: AttributePath;

  constructor(path: AttributePath) {
    this.path = path;
  }

  // TODO: make the values optional
  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names } = params;
    return names.substitute(this.path);
  }
}

/**
 * Factory function to create an `AttributeOperand` with fewer characters.
 *
 * @param path - The path of the attribute this operand represents.
 *
 * @returns A new {@link AttributeOperand} instance for the provided path.
 */
export function attribute(path: AttributePath): AttributeOperand {
  return new AttributeOperand(path);
}
