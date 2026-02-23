import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../formatter.js";
import type { ConditionComparisonInput } from "../condition-comparison.js";
import type { ConditionOperandInput } from "../operand.js";
import { binaryOperation } from "./binary.js";

export type NotEqualsInput = [
  ConditionOperandInput,
  "<>",
  ConditionOperandInput,
];

export type NotEquals = ExpressionFormatter & Brand<"NotEquals">;

export const NotEquals = {
  /**
   * Returns a condition that uses the `<>` operator.
   *
   * @param input - The parameters of the `<>` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link NotEquals} that evaluates to true if this operand is not equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(input: NotEqualsInput): NotEquals {
    return trusted(binaryOperation(input));
  },
};

export function isNotEqualsInput(
  value: ConditionComparisonInput,
): value is NotEqualsInput {
  return value[1] === "<>";
}
