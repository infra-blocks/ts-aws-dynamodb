import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../expression.js";
import { Condition, type ConditionParams } from "./condition.js";

export type Not = ExpressionFormatter & Brand<"Not">;

/**
 * Negates the provided condition using the `NOT` operator.
 *
 * @param condition - The condition to negate.
 *
 * @returns A {@link Not} that evaluates to the opposite of what the provided condition evaluates to.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function not(condition: ConditionParams): Not {
  const expression = Condition.from(condition);
  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) => `(NOT ${expression.format({ names, values })})`,
    ),
  );
}

export type And = ExpressionFormatter & Brand<"And">;

/**
 * Returns a condition that combines the provided ones using the `AND` operator.
 *
 * @param lhs - The first condition to combine.
 * @param rhs - The second condition to combine.
 *
 * @returns An {@link And} that evaluates to true only if both conditions evaluate to true.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function and(lhs: ConditionParams, rhs: ConditionParams): And {
  const left = Condition.from(lhs);
  const right = Condition.from(rhs);
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

export type Or = ExpressionFormatter & Brand<"Or">;

/**
 * Returns a condition that combines the provided ones using the `OR` operator.
 *
 * @param lhs - The first condition to combine.
 * @param rhs - The second condition to combine.
 *
 * @returns An {@link Or} that evaluates to true if any conditions evaluate to true.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function or(lhs: ConditionParams, rhs: ConditionParams): Or {
  const left = Condition.from(lhs);
  const right = Condition.from(rhs);
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
