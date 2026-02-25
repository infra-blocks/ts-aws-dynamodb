import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../formatter.js";
import { Operand, type OperandInput } from "../operands/operand.js";
import {
  PathOrValue,
  type PathOrValueInput,
} from "../operands/path-or-value.js";

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
  first: PathOrValueInput,
  second: OperandInput,
): Contains {
  const firstOperand = PathOrValue.normalize(first);
  const secondOperand = Operand.normalize(second);

  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `contains(${firstOperand.format({ names, values })}, ${secondOperand.format({ names, values })})`,
    ),
  );
}
