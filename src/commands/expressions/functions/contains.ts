import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../formatter.js";
import {
  PathOrValue,
  type PathOrValueInput,
} from "../operands/path-or-value.js";
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
  first: PathOrValueInput,
  second: PathOrValueInput | Size,
): Contains {
  const firstOperand = PathOrValue.normalize(first);
  const secondOperand = isSize(second) ? second : PathOrValue.normalize(second);

  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `contains(${firstOperand.format({ names, values })}, ${secondOperand.format({ names, values })})`,
    ),
  );
}
