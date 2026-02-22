import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../expression.js";
import type { ConditionComparisonParams } from "../condition-comparison.js";
import type { RawConditionOperand } from "../operand.js";
import { binaryOperation } from "./binary.js";

export type NotEqualsParams = [RawConditionOperand, "<>", RawConditionOperand];

export type NotEquals = ExpressionFormatter & Brand<"NotEquals">;

export const NotEquals = {
  /**
   * Returns a condition that uses the `<>` operator.
   *
   * @param params - The parameters of the `<>` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link NotEquals} that evaluates to true if this operand is not equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(params: NotEqualsParams): NotEquals {
    return trusted(binaryOperation(params));
  },
};

export function isNotEqualsParams(
  value: ConditionComparisonParams,
): value is NotEqualsParams {
  return value[1] === "<>";
}
