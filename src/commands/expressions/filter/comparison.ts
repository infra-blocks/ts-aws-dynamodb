import {
  Comparison,
  type ComparisonInput,
  isComparisonInput,
} from "../comparisons/index.js";

/**
 * A type aggregating all values that can be used to produce a {@link FilterComparison}.
 *
 * Those include all available comparison expression inputs.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.FilterExpression.html
 */
export type FilterComparisonInput = ComparisonInput;

export function isFilterComparisonInput(
  input: unknown,
): input is FilterComparisonInput {
  return isComparisonInput(input);
}

/**
 * The {@link ExpressionFormatter} equivalents to their respective {@link FilterComparisonInput}.
 */
export type FilterComparison = Comparison;

export const FilterComparison = {
  /**
   * Creates a {@link FilterComparison} from the provided input.
   *
   * @param input - The {@link FilterComparison}'s input.
   *
   * @returns The corresponding {@link FilterComparison}.
   */
  from(input: FilterComparisonInput): FilterComparison {
    return Comparison.from(input);
  },
};
