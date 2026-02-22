import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../../expression.js";
import type { Operand } from "../../operands/operand.js";
import type { ConditionComparisonParams } from "../condition-comparison.js";
import { ConditionOperand } from "../operand.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type InParams = [ComparableOperand, "IN", ComparableOperand[]];

export type In = ExpressionFormatter & Brand<"In">;

export const In = {
  /**
   * Returns a condition that uses the `IN` operator.
   *
   * This function throws if the list of elements to compared against is empty or exceeds 100 elements.
   *
   * @param params - The parameters of the `IN` comparison. The first element contains the left-hand side operand,
   * the third element contains the list of elements to compare against.
   *
   * @returns An {@link In} that evaluates to true if this operand is equal to any of the provided ones.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(params: InParams): In {
    // TODO: unit test those limits
    if (params[2].length === 0) {
      throw new Error("the IN operator requires at least one operand.");
    }
    if (params[2].length > 100) {
      throw new Error(
        `up to 100 operands are support for the IN operator, got ${params[2].length}`,
      );
    }

    const element = ConditionOperand.normalize<ComparableValue>(params[0]);
    const elements = params[2].map(ConditionOperand.normalize<ComparableValue>);
    return trusted(
      ExpressionFormatter.from(({ names, values }) => {
        const elementsString = elements
          .map((operand) => (operand as Operand).substitute({ names, values }))
          .join(",");
        return `${element.substitute({ names, values })} IN (${elementsString})`;
      }),
    );
  },
};

export function isInParams(
  value: ConditionComparisonParams,
): value is InParams {
  return value[1] === "IN";
}
