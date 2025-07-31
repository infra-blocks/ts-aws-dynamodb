import type { AttributeValue } from "../../../types.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IOperand } from "./type.js";

/**
 * Represents a value operand in an expression.
 *
 * When this operand is stringified, it first registers the
 * value in the {@link AttributeValues} registry and substitutes
 * it with the returned value.
 */
export class Value<T extends AttributeValue = AttributeValue>
  implements IOperand
{
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  substitute(params: { values: AttributeValues }): string {
    const { values } = params;
    return values.substitute(this.value);
  }
}

/**
 * Factory function to create a {@link Value}.
 *
 * @param value - The value this operand represents.
 *
 * @returns A new {@link Value} instance for the provided value.
 */
export function value<T extends AttributeValue = AttributeValue>(
  value: T,
): Value<T> {
  return new Value(value);
}
