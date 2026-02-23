import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../expression.js";
import type { ConditionComparisonInput } from "../condition-comparison.js";
import { binaryOperation } from "./binary.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type LowerThanInput = [ComparableOperand, "<", ComparableOperand];

export type LowerThan = ExpressionFormatter & Brand<"LowerThan">;

export const LowerThan = {
  /**
   * Returns a condition that uses the `<` operator
   *
   * @param input - The parameters of the `<` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link LowerThan} that evaluates to true if this operand is lower than the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(input: LowerThanInput): LowerThan {
    return trusted(binaryOperation<ComparableValue>(input));
  },
};

export function isLowerThanInput(
  value: ConditionComparisonInput,
): value is LowerThanInput {
  return value[1] === "<";
}
