import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../expression.js";
import { operand, type RawOperand } from "../operands/operand.js";
import { isSize, type Size } from "../operands/size.js";

export type Contains = ExpressionFormatter & Brand<"Contains">;

/**
 * Returns a condition that uses the `contains` function.
 *
 * @param first - The first function operand, which is the path or value to check.
 * @param second - The second function operand, which is the value to check for containment.
 *
 * @returns A {@link ConditionExpressionFormatter} that evaluates to true if this operand contains the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function contains(
  first: RawOperand,
  second: RawOperand | Size,
): Contains {
  const firstOperand = operand(first);
  const secondOperand = isSize(second) ? second : operand(second);

  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `contains(${firstOperand.substitute({ names, values })}, ${secondOperand.substitute({ names, values })})`,
    ),
  );
}
