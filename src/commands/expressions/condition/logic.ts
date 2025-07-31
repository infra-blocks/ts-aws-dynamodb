import type { ConditionParams } from "./condition.js";
import { ConditionExpression, conditionExpression } from "./expression.js";

/**
 * Negates the provided condition using the `NOT` operator.
 *
 * @param condition - The condition to negate.
 *
 * @returns A {@link ConditionExpression} that evaluates to the opposite of what the provided condition evaluates to.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function not(condition: ConditionParams): ConditionExpression {
  const expression = conditionExpression(condition);
  return ConditionExpression.from({
    stringify: ({ names, values }) => {
      return `(NOT ${expression.stringify({ names, values })})`;
    },
  });
}

/**
 * Returns a condition that combines the provided ones using the `AND` operator.
 *
 * @param lhs - The first condition to combine.
 * @param rhs - The second condition to combine.
 *
 * @returns A {@link ConditionExpression} that evaluates to true only if both conditions evaluate to true.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function and(
  lhs: ConditionParams,
  rhs: ConditionParams,
): ConditionExpression {
  const left = conditionExpression(lhs);
  const right = conditionExpression(rhs);
  return ConditionExpression.from({
    stringify: ({ names, values }) => {
      return `(${left.stringify({ names, values })} AND ${right.stringify({
        names,
        values,
      })})`;
    },
  });
}

/**
 * Returns a condition that combines the provided ones using the `OR` operator.
 *
 * @param lhs - The first condition to combine.
 * @param rhs - The second condition to combine.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if any conditions evaluate to true.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function or(
  lhs: ConditionParams,
  rhs: ConditionParams,
): ConditionExpression {
  const left = conditionExpression(lhs);
  const right = conditionExpression(rhs);
  return ConditionExpression.from({
    stringify: ({ names, values }) => {
      return `(${left.stringify({ names, values })} OR ${right.stringify({
        names,
        values,
      })})`;
    },
  });
}
