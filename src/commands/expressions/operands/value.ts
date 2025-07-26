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
export class ValueOperand<T extends AttributeValue = AttributeValue>
  implements IOperand
{
  private readonly value: T;

  private constructor(value: T) {
    this.value = value;
  }

  substitute(params: { values: AttributeValues }): string {
    const { values } = params;
    return values.substitute(this.value);
  }

  /**
   * @private
   */
  static from<T extends AttributeValue = AttributeValue>(
    value: T,
  ): ValueOperand<T> {
    return new ValueOperand(value);
  }
}

/**
 * Factory function to create a value operand.
 *
 * @param value - The value this operand represents.
 *
 * @returns A new {@link ValueOperand} instance for the provided value.
 */
export function value<T extends AttributeValue = AttributeValue>(
  value: T,
): ValueOperand<T> {
  return ValueOperand.from(value);
}
