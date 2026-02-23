import type { AttributeValue } from "../../../types.js";
import { ExpressionFormatter } from "../formatter.js";
import { Operand, type OperandInput } from "../operands/index.js";

export function binaryOperation<OI extends OperandInput<AttributeValue>>(
  params: [OI, string, OI],
) {
  const lhs = Operand.normalize<AttributeValue>(params[0]);
  const rhs = Operand.normalize<AttributeValue>(params[2]);

  return ExpressionFormatter.from(
    ({ names, values }) =>
      `${lhs.format({ names, values })} ${params[1]} ${rhs.format({ names, values })}`,
  );
}
