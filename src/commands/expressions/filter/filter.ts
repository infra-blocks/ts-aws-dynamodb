import { Expression } from "../expression.js";
import type { FunctionExpression } from "../functions/index.js";
import type { Logic } from "../logic/index.js";
import type { FilterComparison, FilterComparisonInput } from "./comparison.js";

/**
 * A type aggregating all usable inputs to produce a {@link Filter}.
 */
export type FilterInput = FilterComparisonInput | FilterFunction | FilterLogic;

/**
 * A type aggregating all usable functions in {@link Filter}s.
 *
 * This is an alias for all available functions.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.FilterExpression.html
 */
export type FilterFunction = FunctionExpression;

/**
 * A type aggregating all usable logic in {@link Filter}s.
 *
 * This is an alias for all available logic.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.FilterExpression.html
 */
export type FilterLogic = Logic;

/**
 * A type aggregating all valid {@link Filter}s.
 *
 * All variants are branded {@link ExpressionFormatter}s.
 */
export type Filter = FilterComparison | FilterFunction | FilterLogic;

export const Filter = {
  /**
   * Creates a {@link Filter} from the provided input.
   *
   * @param input - The {@link Filter}'s input.
   *
   * @returns The corresponding {@link Filter}.
   */
  from(input: FilterInput): Filter {
    return Expression.from(input);
  },
};
