import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../formatter.js";
import type { ConditionComparisonInput } from "../condition-comparison.js";
import { binaryOperation } from "./binary.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type GreaterThanOrEqualsInput = [
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
   * @param input - The parameters of the `>=` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link GreaterThanOrEquals} that evaluates to true if this operand is greater than or equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(input: GreaterThanOrEqualsInput): GreaterThanOrEquals {
    return trusted(binaryOperation<ComparableValue>(input));
  },
};

export function isGreaterThanOrEqualsInput(
  value: ConditionComparisonInput,
): value is GreaterThanOrEqualsInput {
  return value[1] === ">=";
}
