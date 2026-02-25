import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import { Expression, type ExpressionInput } from "../expression.js";
import { ExpressionFormatter } from "../formatter.js";

export interface Or<
  Left extends ExpressionInput = ExpressionInput,
  Right extends ExpressionInput = ExpressionInput,
> extends ExpressionFormatter,
    Brand<"Or">,
    Phantom<Left | Right> {}

/**
 * Returns a expression that combines the provided ones using the `OR` operator.
 *
 * @param lhs - The first expression to combine.
 * @param rhs - The second expression to combine.
 *
 * @returns An {@link Or} that evaluates to true if any expressions evaluate to true.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function or<
  Left extends ExpressionInput = ExpressionInput,
  Right extends ExpressionInput = ExpressionInput,
>(lhs: Left, rhs: Right): Or<Left, Right> {
  const left = Expression.from(lhs);
  const right = Expression.from(rhs);
  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `(${left.format({ names, values })} OR ${right.format({
          names,
          values,
        })})`,
    ),
  );
}
