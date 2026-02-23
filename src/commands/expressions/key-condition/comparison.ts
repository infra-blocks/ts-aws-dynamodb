import { unreachable } from "@infra-blocks/types";
import type { KeyAttributeValue } from "../../../types.js";
import {
  Between,
  type BetweenInput,
  Equals,
  type EqualsInput,
  GreaterThan,
  type GreaterThanInput,
  GreaterThanOrEquals,
  type GreaterThanOrEqualsInput,
  isBetweenInput,
  isEqualsInput,
  isGreaterThanInput,
  isGreaterThanOrEqualsInput,
  isLowerThanInput,
  isLowerThanOrEqualsInput,
  LowerThan,
  type LowerThanInput,
  LowerThanOrEquals,
  type LowerThanOrEqualsInput,
} from "../comparisons/index.js";
import type { PathOrValue, PathOrValueInput } from "../operands/index.js";

/**
 * A type aggregating all values that can be used to produce a {@link KeyConditionComparison}.
 *
 * Note: {@link KeyConditionComparison}s are a subset of condition comparisons in 2 ways:
 * - They do not allow all comparisons. For example, `in` and `<>` (not equals) are not allowed.
 * - The attribute types on which they operate are necessarily {@link KeyAttributeValue}s, which is
 * a subset of the inputs allowed in condition comparisons.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.KeyConditionExpressions.html#Query.KeyConditionExpressions-example
 */
export type KeyConditionComparisonInput =
  | BetweenInput<PathOrValueInput<KeyAttributeValue>>
  | EqualsInput<PathOrValueInput<KeyAttributeValue>>
  | GreaterThanInput<PathOrValueInput<KeyAttributeValue>>
  | GreaterThanOrEqualsInput<PathOrValueInput<KeyAttributeValue>>
  | LowerThanInput<PathOrValueInput<KeyAttributeValue>>
  | LowerThanOrEqualsInput<PathOrValueInput<KeyAttributeValue>>;

export function isKeyConditionComparisonInput(
  input: unknown,
): input is KeyConditionComparisonInput {
  return (
    isBetweenInput(input) ||
    isEqualsInput(input) ||
    isGreaterThanInput(input) ||
    isGreaterThanOrEqualsInput(input) ||
    isLowerThanInput(input) ||
    isLowerThanOrEqualsInput(input)
  );
}

/**
 * The {@link ExpressionFormatter} equivalents to their respective {@link KeyConditionComparisonInput}.
 */
export type KeyConditionComparison =
  | Between<PathOrValue<KeyAttributeValue>>
  | Equals<PathOrValue<KeyAttributeValue>>
  | GreaterThan<PathOrValue<KeyAttributeValue>>
  | GreaterThanOrEquals<PathOrValue<KeyAttributeValue>>
  | LowerThan<PathOrValue<KeyAttributeValue>>
  | LowerThanOrEquals<PathOrValue<KeyAttributeValue>>;

export const KeyConditionComparison = {
  /**
   * Creates a {@link KeyConditionComparison} from the provided input.
   *
   * @param input - The {@link KeyConditionComparison}'s input.
   *
   * @returns The corresponding {@link KeyConditionComparison}.
   */
  from(input: KeyConditionComparisonInput): KeyConditionComparison {
    if (isBetweenInput(input)) {
      return Between.from(input);
    }
    if (isEqualsInput(input)) {
      return Equals.from(input);
    }
    if (isGreaterThanInput(input)) {
      return GreaterThan.from(input);
    }
    if (isGreaterThanOrEqualsInput(input)) {
      return GreaterThanOrEquals.from(input);
    }
    if (isLowerThanInput(input)) {
      return LowerThan.from(input);
    }
    if (isLowerThanOrEqualsInput(input)) {
      return LowerThanOrEquals.from(input);
    }
    unreachable(input);
  },
};
