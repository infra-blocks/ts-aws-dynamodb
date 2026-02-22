import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../expression.js";
import type { ConditionComparisonParams } from "../condition-comparison.js";
import { binaryOperation } from "./binary.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type LowerThanOrEqualsParams = [
  ComparableOperand,
  "<=",
  ComparableOperand,
];

export type LowerThanOrEquals = ExpressionFormatter &
  Brand<"LowerThanOrEquals">;

export const LowerThanOrEquals = {
  /**
   * Returns a condition that uses the `<=` operator.
   *
   * @param params - The parameters of the `<=` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link LowerThanOrEquals} that evaluates to true if this operand is lower than or equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(params: LowerThanOrEqualsParams): LowerThanOrEquals {
    return trusted(binaryOperation<ComparableValue>(params));
  },
};

export function isLowerThanOrEqualsParams(
  value: ConditionComparisonParams,
): value is LowerThanOrEqualsParams {
  return value[1] === "<=";
}
