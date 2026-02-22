import type { AttributeValue } from "../../../types.js";
import { type Operand, operand, type RawOperand } from "../operands/operand.js";
import { isSize, type Size } from "../operands/size.js";

export type ConditionOperand<T extends AttributeValue = AttributeValue> =
  | Operand<T>
  | Size;

export type RawConditionOperand<T extends AttributeValue = AttributeValue> =
  | RawOperand<T>
  | Size;
// TODO: internal

export const ConditionOperand = {
  normalize<T extends AttributeValue = AttributeValue>(
    raw: RawConditionOperand<T>,
  ): ConditionOperand<T> {
    if (isSize(raw)) {
      return raw;
    }
    return operand<T>(raw);
  },
};
