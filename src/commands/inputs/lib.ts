import type { AttributePath, AttributeValue } from "../../types.js";
import {
  AttributeNames,
  AttributeValues,
  type PathSubstitution,
  type ValueSubstitution,
} from "../attributes/index.js";
import { conditionExpression } from "../expressions/condition/expression.js";
import type { ConditionParams } from "../expressions/index.js";

export type ConditionCheckFailureReturnValue = "NONE" | "ALL_OLD";

export function intoExpressionComponents(condition: ConditionParams): {
  expression: string;
  names?: Record<PathSubstitution, AttributePath>;
  values?: Record<ValueSubstitution, AttributeValue>;
} {
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  const expression = conditionExpression(condition).stringify({
    names,
    values,
  });
  return {
    expression,
    names: names.getSubstitutions(),
    values: values.getSubstitutions(),
  };
}
