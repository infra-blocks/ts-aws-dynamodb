import type {
  AttributeExists,
  AttributeNotExists,
  BeginsWith,
  Contains,
  IsAttributeOfType,
} from "../functions/index.js";
import {
  ConditionComparison,
  type ConditionComparisonInput,
  isConditionComparisonInput,
} from "./condition-comparison.js";
import type { And, Not, Or } from "./logic.js";

export type ConditionInput =
  | ConditionComparisonInput
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
  from(input: ConditionInput): Condition {
    if (isConditionComparisonInput(input)) {
      return ConditionComparison.from(input);
    }
    return input;
  },
};
