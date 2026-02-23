import type { AttributeValue } from "../../../types.js";
import { Operand, type OperandInput } from "../operands/index.js";

export type ConditionOperand<T extends AttributeValue = AttributeValue> =
  Operand<T>;

export type ConditionOperandInput<T extends AttributeValue = AttributeValue> =
  OperandInput<T>;

export const ConditionOperand = {
  normalize: Operand.normalize,
};
