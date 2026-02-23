import { unreachable } from "@infra-blocks/types";
import {
  Between,
  type BetweenInput,
  isBetweenInput,
} from "./comparisons/between.js";
import {
  Equals,
  type EqualsInput,
  isEqualsInput,
} from "./comparisons/equals.js";
import {
  type GreaterThan,
  type GreaterThanInput,
  GreatThan,
  isGreaterThanInput,
} from "./comparisons/greater-than.js";
import {
  GreaterThanOrEquals,
  type GreaterThanOrEqualsInput,
  isGreaterThanOrEqualsInput,
} from "./comparisons/greater-than-or-equals.js";
import { In, type InInput, isInInput } from "./comparisons/in.js";
import {
  isLowerThanInput,
  LowerThan,
  type LowerThanInput,
} from "./comparisons/lower-than.js";
import {
  isLowerThanOrEqualsInput,
  LowerThanOrEquals,
  type LowerThanOrEqualsInput,
} from "./comparisons/lower-than-or-equals.js";
import {
  isNotEqualsInput,
  NotEquals,
  type NotEqualsInput,
} from "./comparisons/not-equals.js";
import type { ConditionInput } from "./condition.js";

export type ConditionComparisonInput =
  | BetweenInput
  // TODO: test that lhs can also be a size function IRL on all these comparisons.
  | EqualsInput
  | GreaterThanInput
  | GreaterThanOrEqualsInput
  | InInput
  | LowerThanInput
  | LowerThanOrEqualsInput
  | NotEqualsInput;

export type ConditionComparison =
  | Between
  | Equals
  | GreaterThan
  | GreaterThanOrEquals
  | In
  | LowerThan
  | LowerThanOrEquals
  | NotEquals;

export const ConditionComparison = {
  from(input: ConditionComparisonInput): ConditionComparison {
    if (isBetweenInput(input)) {
      return Between.from(input);
    }
    if (isEqualsInput(input)) {
      return Equals.from(input);
    }
    if (isGreaterThanInput(input)) {
      return GreatThan.from(input);
    }
    if (isGreaterThanOrEqualsInput(input)) {
      return GreaterThanOrEquals.from(input);
    }
    if (isInInput(input)) {
      return In.from(input);
    }
    if (isLowerThanInput(input)) {
      return LowerThan.from(input);
    }
    if (isLowerThanOrEqualsInput(input)) {
      return LowerThanOrEquals.from(input);
    }
    if (isNotEqualsInput(input)) {
      return NotEquals.from(input);
    }
    unreachable(input);
  },
};

export function isConditionComparisonInput(
  input: ConditionInput,
): input is ConditionComparisonInput {
  const casted = input as ConditionComparisonInput;
  return (
    isBetweenInput(casted) ||
    isEqualsInput(casted) ||
    isGreaterThanInput(casted) ||
    isGreaterThanOrEqualsInput(casted) ||
    isInInput(casted) ||
    isLowerThanInput(casted) ||
    isLowerThanOrEqualsInput(casted) ||
    isNotEqualsInput(casted)
  );
}
