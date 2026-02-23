import type { AttributeValue } from "../../../types.js";
import {
  PathOrValue,
  type PathOrValueInput,
} from "../operands/path-or-value.js";
import { isSize, type Size } from "../operands/size.js";

export type ConditionOperand<T extends AttributeValue = AttributeValue> =
  | PathOrValue<T>
  | Size;

export type ConditionOperandInput<T extends AttributeValue = AttributeValue> =
  | PathOrValueInput<T>
  | Size;

// TODO: internal
export const ConditionOperand = {
  normalize<T extends AttributeValue = AttributeValue>(
    input: ConditionOperandInput<T>,
  ): ConditionOperand<T> {
    if (isSize(input)) {
      return input;
    }
    return PathOrValue.normalize<T>(input);
  },
};
