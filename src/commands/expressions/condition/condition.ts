import type { AttributeValue } from "../../../types.js";
import { type Operand, operand, type RawOperand } from "../operands/index.js";
import type { ConditionComparisonParams } from "./comparisons.js";
import type { ConditionExpression } from "./expression.js";
import { isSize, type Size } from "./size.js";

export type ConditionParams =
  | ConditionExpression
  | ConditionComparisonParams
  | ConditionExpression;

export type ConditionOperand<T extends AttributeValue = AttributeValue> =
  | Operand<T>
  | Size;

export type RawConditionOperand<T extends AttributeValue = AttributeValue> =
  | RawOperand<T>
  | Size;

export function conditionOperand<T extends AttributeValue = AttributeValue>(
  raw: RawConditionOperand<T>,
): ConditionOperand<T> {
  if (isSize(raw)) {
    return raw;
  }
  return operand<T>(raw);
}
