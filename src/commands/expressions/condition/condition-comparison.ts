import { unreachable } from "@infra-blocks/types";
import {
  Between,
  type BetweenParams,
  isBetweenParams,
} from "./comparisons/between.js";
import {
  Equals,
  type EqualsParams,
  isEqualsParams,
} from "./comparisons/equals.js";
import {
  type GreaterThan,
  type GreaterThanParams,
  GreatThan,
  isGreaterThanParams,
} from "./comparisons/greater-than.js";
import {
  GreaterThanOrEquals,
  type GreaterThanOrEqualsParams,
  isGreaterThanOrEqualsParams,
} from "./comparisons/greater-than-or-equals.js";
import { In, type InParams, isInParams } from "./comparisons/in.js";
import {
  isLowerThanParams,
  LowerThan,
  type LowerThanParams,
} from "./comparisons/lower-than.js";
import {
  isLowerThanOrEqualsParams,
  LowerThanOrEquals,
  type LowerThanOrEqualsParams,
} from "./comparisons/lower-than-or-equals.js";
import {
  isNotEqualsParams,
  NotEquals,
  type NotEqualsParams,
} from "./comparisons/not-equals.js";
import type { ConditionParams } from "./condition.js";

export type ConditionComparisonParams =
  | BetweenParams
  // TODO: test that lhs can also be a size function IRL on all these comparisons.
  | EqualsParams
  | GreaterThanParams
  | GreaterThanOrEqualsParams
  | InParams
  | LowerThanParams
  | LowerThanOrEqualsParams
  | NotEqualsParams;

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
  from(params: ConditionComparisonParams): ConditionComparison {
    if (isBetweenParams(params)) {
      return Between.from(params);
    }
    if (isEqualsParams(params)) {
      return Equals.from(params);
    }
    if (isGreaterThanParams(params)) {
      return GreatThan.from(params);
    }
    if (isGreaterThanOrEqualsParams(params)) {
      return GreaterThanOrEquals.from(params);
    }
    if (isInParams(params)) {
      return In.from(params);
    }
    if (isLowerThanParams(params)) {
      return LowerThan.from(params);
    }
    if (isLowerThanOrEqualsParams(params)) {
      return LowerThanOrEquals.from(params);
    }
    if (isNotEqualsParams(params)) {
      return NotEquals.from(params);
    }
    unreachable(params);
  },
};

export function isConditionComparisonParams(
  params: ConditionParams,
): params is ConditionComparisonParams {
  const casted = params as ConditionComparisonParams;
  return (
    isBetweenParams(casted) ||
    isEqualsParams(casted) ||
    isGreaterThanParams(casted) ||
    isGreaterThanOrEqualsParams(casted) ||
    isInParams(casted) ||
    isLowerThanParams(casted) ||
    isLowerThanOrEqualsParams(casted) ||
    isNotEqualsParams(casted)
  );
}
