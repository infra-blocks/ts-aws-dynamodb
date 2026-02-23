import type { FunctionExpression } from "../functions/index.js";
import type { Logic } from "../logic/index.js";
import {
  ConditionComparison,
  type ConditionComparisonInput,
  isConditionComparisonInput,
} from "./comparison.js";

export type ConditionInput =
  | ConditionComparisonInput
  | ConditionFunction
  | ConditionLogic;

export type ConditionFunction = FunctionExpression;

export type ConditionLogic = Logic;

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
