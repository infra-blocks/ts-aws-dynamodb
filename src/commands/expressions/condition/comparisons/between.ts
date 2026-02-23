import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../../formatter.js";
import type { ConditionComparisonInput } from "../condition-comparison.js";
import { ConditionOperand } from "../operand.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type BetweenInput = [
  ComparableOperand,
  "BETWEEN",
  ComparableOperand,
  "AND",
  ComparableOperand,
];

export function isBetweenInput(
  value: ConditionComparisonInput,
): value is BetweenInput {
  return value[1] === "BETWEEN" && value[3] === "AND";
}

export type Between = ExpressionFormatter & Brand<"Between">;

export const Between = {
  /**
   * Returns a condition that uses the `BETWEEN` operator.
   *
   * Both bounds are inclusive, meaning that the returned condition corresponds to `lower <= lhs <= upper`.
   *
   * @param input - The parameters of the `BETWEEN` comparison. The first element contains the left-hand side operand,
   * the third element contains the lower inclusive bound, and the fifth element contains the upper inclusive bound.
   *
   * @returns A {@link Between} that evaluates to true if this operand is within the provided bounds.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(input: BetweenInput): Between {
    const lhs = ConditionOperand.normalize<ComparableValue>(input[0]);
    const lower = ConditionOperand.normalize<ComparableValue>(input[2]);
    const upper = ConditionOperand.normalize<ComparableValue>(input[4]);

    return trusted(
      ExpressionFormatter.from(
        ({ names, values }) =>
          `${lhs.format({ names, values })} BETWEEN ${lower.format({ names, values })} AND ${upper.format({ names, values })}`,
      ),
    );
  },
};
