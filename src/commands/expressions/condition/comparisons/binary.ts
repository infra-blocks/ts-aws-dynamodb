import type { AttributeValue } from "../../../../types.js";
import { ExpressionFormatter } from "../../formatter.js";
import { ConditionOperand, type ConditionOperandInput } from "../operand.js";

export function binaryOperation<T extends AttributeValue = AttributeValue>(
  params: [ConditionOperandInput<T>, string, ConditionOperandInput<T>],
) {
  const lhs = ConditionOperand.normalize<T>(params[0]);
  const rhs = ConditionOperand.normalize<T>(params[2]);

  return ExpressionFormatter.from(
    ({ names, values }) =>
      `${lhs.format({ names, values })} ${params[1]} ${rhs.format({ names, values })}`,
  );
}
