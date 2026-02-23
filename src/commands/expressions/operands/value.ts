import { type Brand, trusted } from "@infra-blocks/types";
import {
  type AttributePath,
  type AttributeValue,
  isNativeBinary,
  isNativeBoolean,
  isNativeList,
  isNativeMap,
  isNativeNull,
  isNativeNumber,
  isNativeSet,
} from "../../../types.js";
import {
  ExpressionFormatter,
  isExpressionFormatter,
  type ValueFormatter,
} from "../formatter.js";

/**
 * Any type that isn't an implicit path is an implicit value.
 */
export type ImplicitValue = Exclude<AttributeValue, AttributePath>;

/**
 * A type representing the accepted inputs in place of a {@link Value}.
 *
 * It's a conditional type where a value can be expressed as a primitive
 * unless it is a string, then it *must* be of type {@link Value}.
 */
export type ValueInput<T extends AttributeValue = AttributeValue> =
  T extends ImplicitValue ? T | Value<T> : Value<T>;

// TODO: include branding in base formatter?
export type Value<T extends AttributeValue = AttributeValue> = ValueFormatter &
  Brand<"Value"> & { readonly type: "Value"; readonly _phantom?: T };

export const Value = {
  from<T extends AttributeValue = AttributeValue>(value: T): Value<T> {
    return trusted({
      type: "Value",
      ...ExpressionFormatter.from(({ values }) => values.substitute(value)),
    });
  },
  normalize<T extends AttributeValue = AttributeValue>(
    input: ValueInput<T>,
  ): Value<T> {
    if (isValue<T>(input)) {
      return input;
    }
    return Value.from<T>(input as T);
  },
};

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

/**
 * A type guard to assess if something is a {@link ValueInput}.
 *
 * @param value - The operand to test.
 *
 * @returns Whether the operand is a {@link ValueInput}.
 */
export function isValueInput<T extends AttributeValue = AttributeValue>(
  value: unknown,
): value is ValueInput<T> {
  return isValue<T>(value) || isImplicitValue(value);
}

function isImplicitValue(value: unknown): value is ImplicitValue {
  // Any of the native types *but* NativeString.
  return (
    isNativeBinary(value) ||
    isNativeBoolean(value) ||
    isNativeList(value) ||
    isNativeMap(value) ||
    isNativeNull(value) ||
    isNativeNumber(value) ||
    isNativeSet(value)
  );
}

export function isValue<T extends AttributeValue>(
  value: unknown,
): value is Value<T> {
  return (
    isExpressionFormatter(value) && "type" in value && value.type === "Value"
  );
}
