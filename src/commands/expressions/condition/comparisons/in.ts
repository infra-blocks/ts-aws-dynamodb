import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../../formatter.js";
import type { PathOrValue } from "../../operands/path-or-value.js";
import type { ConditionComparisonInput } from "../condition-comparison.js";
import { ConditionOperand } from "../operand.js";
import type { ComparableOperand, ComparableValue } from "./operand.js";

export type InInput = [ComparableOperand, "IN", ComparableOperand[]];

export type In = ExpressionFormatter & Brand<"In">;

export const In = {
  /**
   * Returns a condition that uses the `IN` operator.
   *
   * This function throws if the list of elements to compared against is empty or exceeds 100 elements.
   *
   * @param input - The parameters of the `IN` comparison. The first element contains the left-hand side operand,
   * the third element contains the list of elements to compare against.
   *
   * @returns An {@link In} that evaluates to true if this operand is equal to any of the provided ones.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from(input: InInput): In {
    // TODO: unit test those limits
    if (input[2].length === 0) {
      throw new Error("the IN operator requires at least one operand.");
    }
    if (input[2].length > 100) {
      throw new Error(
        `up to 100 operands are support for the IN operator, got ${input[2].length}`,
      );
    }

    const element = ConditionOperand.normalize<ComparableValue>(input[0]);
    const elements = input[2].map(ConditionOperand.normalize<ComparableValue>);
    return trusted(
      ExpressionFormatter.from(({ names, values }) => {
        const elementsString = elements
          .map((operand) => (operand as PathOrValue).format({ names, values }))
          .join(",");
        return `${element.format({ names, values })} IN (${elementsString})`;
      }),
    );
  },
};

export function isInInput(value: ConditionComparisonInput): value is InInput {
  return value[1] === "IN";
}
