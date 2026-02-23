import type { BeginsWith } from "../functions/begins-with.js";
import type { And } from "../logic/index.js";
import {
  isKeyConditionComparisonInput,
  KeyConditionComparison,
  type KeyConditionComparisonInput,
} from "./comparison.js";

/**
 * A type aggregating all usable inputs to produce a {@link KeyCondition}.
 */
export type KeyConditionInput =
  | KeyConditionComparisonInput
  | KeyConditionFunction
  | KeyConditionLogic;

/**
 * A type aggregating all usable functions in {@link KeyCondition}s.
 *
 * Only the `begins_with` function is accessible.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.KeyConditionExpressions.html#Query.KeyConditionExpressions-example
 */
export type KeyConditionFunction = BeginsWith;

/**
 * A type aggregating all usable logic in {@link KeyCondition}s.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.KeyConditionExpressions.html#Query.KeyConditionExpressions-example
 */
export type KeyConditionLogic = And<KeyConditionInput, KeyConditionInput>;

/**
 * A type aggregating all valid {@link KeyCondition}s.
 *
 * All variants are branded {@link ExpressionFormatter}s.
 */
export type KeyCondition =
  | KeyConditionComparison
  | KeyConditionFunction
  | KeyConditionLogic;

export const KeyCondition = {
  /**
   * Creates a {@link KeyCondition} from the provided input.
   *
   * @param input - The {@link KeyCondition}'s input.
   *
   * @returns The corresponding {@link KeyCondition}.
   */
  from(input: KeyConditionInput): KeyCondition {
    if (isKeyConditionComparisonInput(input)) {
      return KeyConditionComparison.from(input);
    }
    return input;
  },
};
