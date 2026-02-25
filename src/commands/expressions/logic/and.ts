import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import { Expression, type ExpressionInput } from "../expression.js";
import { ExpressionFormatter } from "../formatter.js";

// Written as interface to circumvent circular declaration compilation failure.
export interface And<
  Left extends ExpressionInput = ExpressionInput,
  Right extends ExpressionInput = ExpressionInput,
> extends ExpressionFormatter,
    Brand<"And">,
    Phantom<Left | Right> {}

/**
 * Returns a expression that combines the provided ones using the `AND` operator.
 *
 * @param lhs - The first expression to combine.
 * @param rhs - The second expression to combine.
 *
 * @returns An {@link And} that evaluates to true only if both expressions evaluate to true.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function and<
  Left extends ExpressionInput = ExpressionInput,
  Right extends ExpressionInput = ExpressionInput,
>(lhs: Left, rhs: Right): And<Left, Right> {
  const left = Expression.from(lhs);
  const right = Expression.from(rhs);
  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `(${left.format({ names, values })} AND ${right.format({
          names,
          values,
        })})`,
    ),
  );
}
