import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../expression.js";
import type { ConditionComparisonParams } from "../condition-comparison.js";
import { binaryOperation } from "./binary.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type GreaterThanParams = [ComparableOperand, ">", ComparableOperand];

export type GreaterThan = ExpressionFormatter & Brand<"GreaterThan">;

export const GreatThan = {
  /**
   * Returns a condition that uses the `>` operator.
   *
   * @param params - The parameters of the `>` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link GreaterThan} that evaluates to true if this operand is greater than the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(params: GreaterThanParams): GreaterThan {
    return trusted(binaryOperation<ComparableValue>(params));
  },
};

export function isGreaterThanParams(
  value: ConditionComparisonParams,
): value is GreaterThanParams {
  return value[1] === ">";
}
