import { isSet } from "node:util/types";
import { isPlainObject } from "@infra-blocks/types";
import {
  type AttributeValue,
  isNativeBinary,
  isNativeBoolean,
  isNativeNull,
  isNativeNumber,
  type NativeString,
} from "../../../types.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IOperand } from "./interface.js";

/**
 * This type regroups the types that are considered value operands by default.
 *
 * This is basically any valid {@link AttributeValue} except for {@link NativeString}.
 * Strings default to path operands instead. Every other convertible value defaults
 * to value operands.
 */
export type LooseValueOperand<T extends AttributeValue = AttributeValue> =
  | Omit<AttributeValue, NativeString>
  | ValueOperand<T>;

// A value can be constructred from a string
export type ValueOperandParams<T extends AttributeValue = AttributeValue> =
  | T
  | ValueOperand<T>;

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
 * This function transforms a loose value operand into a strict {@link ValueOperand}.
 *
 * @param value - The value of the attribute this operand represents. If it is a valid
 * scalar value (such as number, or binary), then it is converted to a {@link ValueOperand}.
 * If it is already a {@link ValueOperand}, then it is returned as is.
 *
 * @returns The corresponding {@link ValueOperand} instance for the provided value.
 */
export function value<T extends AttributeValue = AttributeValue>(
  value: T | ValueOperand<T>,
): ValueOperand<T> {
  if (isValueOperand<T>(value)) {
    return value;
  }

  return ValueOperand.from(value);
}

/**
 * A type guard for detecting loose value operands.
 *
 * @param value - The value to check.
 *
 * @returns True if the operand is a loose value operand, false otherwise.
 */
export function isLooseValueOperand(
  value: unknown,
): value is LooseValueOperand {
  return (
    isValueOperand(value) ||
    // Any DynamoDB scalar type that isn't a string is valid.
    isNativeBinary(value) ||
    isNativeBoolean(value) ||
    isNativeNull(value) ||
    isNativeNumber(value) ||
    // For the complex types, we do not check their elements dynamically,
    // but we make the assumption that the user isn't a cunt.
    // A list.
    Array.isArray(value) ||
    // A map.
    isPlainObject(value) ||
    // A set.
    isSet(value)
  );
}

/**
 * A type guard for detecting value operands.
 *
 * @param value - The value to check.
 *
 * @returns True if the operand is a value operand, false otherwise.
 */
export function isValueOperand<T extends AttributeValue = AttributeValue>(
  value: unknown,
): value is ValueOperand<T> {
  return value instanceof ValueOperand;
}
