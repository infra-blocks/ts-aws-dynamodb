import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../formatter.js";
import type { ConditionComparisonInput } from "../condition-comparison.js";
import type { ConditionOperandInput } from "../operand.js";
import { binaryOperation } from "./binary.js";

export type EqualsInput = [ConditionOperandInput, "=", ConditionOperandInput];

export type Equals = ExpressionFormatter & Brand<"Equals">;

export const Equals = {
  /**
   * Returns a condition that uses the `=` operator.
   *
   * @param input - The parameters of the `=` comparison. The first element contains the left-hand side operand,
   * and the third element contains the right-hand side operand.
   *
   * @returns An {@link Equals} that evaluates to true if this operand is equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(input: EqualsInput): Equals {
    return trusted(binaryOperation(input));
  },
};

export function isEqualsInput(
  value: ConditionComparisonInput,
): value is EqualsInput {
  return value[1] === "=";
}
