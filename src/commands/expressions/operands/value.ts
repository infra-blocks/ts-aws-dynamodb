import type { AttributePath, AttributeValue } from "../../../types.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IOperand } from "./type.js";

export type ImplicitValue = Exclude<AttributeValue, AttributePath>;

export type RawValue<T extends AttributeValue = AttributeValue> =
  T extends ImplicitValue ? T | Value<T> : Value<T>;

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
  static from<T extends AttributeValue = AttributeValue>(value: T): Value<T> {
    return new Value(value);
  }

  // TODO: docs
  /**
   *
   * @param value
   * @returns
   */
  static normalize<T extends AttributeValue = AttributeValue>(
    value: RawValue<T>,
  ): Value<T> {
    if (value instanceof Value) {
      return value as Value<T>;
    }

    return Value.from(value) as Value<T>;
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
  return Value.from(value);
}
