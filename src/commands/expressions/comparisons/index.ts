import { unreachable } from "@infra-blocks/types";
import { Between, type BetweenInput, isBetweenInput } from "./between.js";
import { Equals, type EqualsInput, isEqualsInput } from "./equals.js";
import {
  GreaterThan,
  type GreaterThanInput,
  isGreaterThanInput,
} from "./greater-than.js";
import {
  GreaterThanOrEquals,
  type GreaterThanOrEqualsInput,
  isGreaterThanOrEqualsInput,
} from "./greater-than-or-equals.js";
import { In, type InInput, isInInput } from "./in.js";
import {
  isLowerThanInput,
  LowerThan,
  type LowerThanInput,
} from "./lower-than.js";
import {
  isLowerThanOrEqualsInput,
  LowerThanOrEquals,
  type LowerThanOrEqualsInput,
} from "./lower-than-or-equals.js";
import {
  isNotEqualsInput,
  NotEquals,
  type NotEqualsInput,
} from "./not-equals.js";

export * from "./between.js";
export * from "./comparable.js";
export * from "./equals.js";
export * from "./greater-than.js";
export * from "./greater-than-or-equals.js";
export * from "./in.js";
export * from "./lower-than.js";
export * from "./lower-than-or-equals.js";
export * from "./not-equals.js";

/**
 * A type aggregating anything that can be turned into a comparison.
 */
export type ComparisonInput =
  | BetweenInput
  // TODO: test that lhs can also be a size function IRL on all these comparisons.
  | EqualsInput
  | GreaterThanInput
  | GreaterThanOrEqualsInput
  | InInput
  | LowerThanInput
  | LowerThanOrEqualsInput
  | NotEqualsInput;

export function isComparisonInput(value: unknown): value is ComparisonInput {
  return (
    isBetweenInput(value) ||
    isEqualsInput(value) ||
    isGreaterThanInput(value) ||
    isGreaterThanOrEqualsInput(value) ||
    isInInput(value) ||
    isLowerThanInput(value) ||
    isLowerThanOrEqualsInput(value) ||
    isNotEqualsInput(value)
  );
}

/**
 * A type aggregating all comparisons.
 */
export type Comparison =
  | Between
  | Equals
  | GreaterThan
  | GreaterThanOrEquals
  | In
  | LowerThan
  | LowerThanOrEquals
  | NotEquals;

export const Comparison = {
  from(input: ComparisonInput): Comparison {
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
