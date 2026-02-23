import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import { Expression, type ExpressionInput } from "../expression.js";
import { ExpressionFormatter } from "../formatter.js";

export interface Not<I extends ExpressionInput = ExpressionInput>
  extends ExpressionFormatter,
    Brand<"Not">,
    Phantom<I> {}

/**
 * Negates the provided expression using the `NOT` operator.
 *
 * @param input - The expressions to negate.
 *
 * @returns A {@link Not} that evaluates to the opposite of what the provided expression evaluates to.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function not<I extends ExpressionInput = ExpressionInput>(
  input: I,
): Not<I> {
  const expression = Expression.from(input);
  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) => `(NOT ${expression.format({ names, values })})`,
    ),
  );
}
