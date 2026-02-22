import type {
  AttributeExists,
  AttributeNotExists,
  BeginsWith,
  Contains,
  IsAttributeOfType,
} from "../functions/index.js";
import {
  ConditionComparison,
  type ConditionComparisonParams,
  isConditionComparisonParams,
} from "./condition-comparison.js";
import type { And, Not, Or } from "./logic.js";

export type ConditionParams =
  | ConditionComparisonParams
  | ConditionFunction
  | ConditionLogic;

export type ConditionFunction =
  | AttributeExists
  | AttributeNotExists
  | BeginsWith
  | IsAttributeOfType
  | Contains;

export type ConditionLogic = And | Not | Or;

export type Condition =
  | ConditionComparison
  | ConditionFunction
  | ConditionLogic;

export const Condition = {
  from(params: ConditionParams): Condition {
    if (isConditionComparisonParams(params)) {
      return ConditionComparison.from(params);
    }
    return params;
  },
};
