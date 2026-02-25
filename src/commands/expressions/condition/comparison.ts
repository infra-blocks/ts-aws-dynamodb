import {
  Comparison,
  type ComparisonInput,
  isComparisonInput,
} from "../comparisons/index.js";
import type { ConditionInput } from "./index.js";

export type ConditionComparisonInput = ComparisonInput;

export type ConditionComparison = Comparison;

export const ConditionComparison = {
  from(input: ConditionComparisonInput): ConditionComparison {
    return Comparison.from(input);
  },
};

export function isConditionComparisonInput(
  input: ConditionInput,
): input is ConditionComparisonInput {
  return isComparisonInput(input);
}
