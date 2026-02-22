import { type Brand, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../../expression.js";
import type { ConditionComparisonParams } from "../condition-comparison.js";
import type { RawConditionOperand } from "../operand.js";
import { binaryOperation } from "./binary.js";

export type EqualsParams = [RawConditionOperand, "=", RawConditionOperand];

export type Equals = ExpressionFormatter & Brand<"Equals">;

export const Equals = {
  /**
   * Returns a condition that uses the `=` operator.
   *
   * @param params - The parameters of the `=` comparison. The first element contains the left-hand side operand,
   * and the third element contains the right-hand side operand.
   *
   * @returns An {@link Equals} that evaluates to true if this operand is equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(params: EqualsParams): Equals {
    return trusted(binaryOperation(params));
  },
};

export function isEqualsParams(
  value: ConditionComparisonParams,
): value is EqualsParams {
  return value[1] === "=";
}
