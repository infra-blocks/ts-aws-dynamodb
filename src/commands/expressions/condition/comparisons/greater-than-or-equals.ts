import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../expression.js";
import type { ConditionComparisonParams } from "../condition-comparison.js";
import { binaryOperation } from "./binary.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type GreaterThanOrEqualsParams = [
  ComparableOperand,
  ">=",
  ComparableOperand,
];

export type GreaterThanOrEquals = ExpressionFormatter &
  Brand<"GreaterThanOrEquals">;

export const GreaterThanOrEquals = {
  /**
   * Returns a condition that uses the `>=` operator.
   *
   * @param params - The parameters of the `>=` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link GreaterThanOrEquals} that evaluates to true if this operand is greater than or equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(params: GreaterThanOrEqualsParams): GreaterThanOrEquals {
    return trusted(binaryOperation<ComparableValue>(params));
  },
};

export function isGreaterThanOrEqualsParams(
  value: ConditionComparisonParams,
): value is GreaterThanOrEqualsParams {
  return value[1] === ">=";
}
