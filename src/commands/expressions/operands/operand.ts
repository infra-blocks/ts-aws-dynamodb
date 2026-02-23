import type { AttributeValue } from "../../../types.js";
import {
  isPathOrValueInput,
  PathOrValue,
  type PathOrValueInput,
} from "./path-or-value.js";
import { isSize, type Size } from "./size.js";

/**
 * What can serve as input for {@link Operand} normalization.
 */
export type OperandInput<T extends AttributeValue = AttributeValue> =
  | PathOrValueInput<T>
  | Size;

export function isOperandInput<T extends AttributeValue = AttributeValue>(
  value: unknown,
): value is Operand<T> {
  return isPathOrValueInput<T>(value) || isSize(value);
}

/**
 * A grouping of all operands available.
 */
export type Operand<T extends AttributeValue = AttributeValue> =
  | PathOrValue<T>
  | Size;

export const Operand = {
  normalize<T extends AttributeValue = AttributeValue>(
    input: OperandInput<T>,
  ): Operand<T> {
    if (isSize(input)) {
      return input;
    }
    return PathOrValue.normalize<T>(input);
  },
};
