import type { AttributeValue } from "../../../../types.js";
import { ExpressionFormatter } from "../../expression.js";
import { ConditionOperand, type RawConditionOperand } from "../operand.js";

export function binaryOperation<T extends AttributeValue = AttributeValue>(
  params: [RawConditionOperand<T>, string, RawConditionOperand<T>],
) {
  const lhs = ConditionOperand.normalize<T>(params[0]);
  const rhs = ConditionOperand.normalize<T>(params[2]);

  return ExpressionFormatter.from(
    ({ names, values }) =>
      `${lhs.substitute({ names, values })} ${params[1]} ${rhs.substitute({ names, values })}`,
  );
}
