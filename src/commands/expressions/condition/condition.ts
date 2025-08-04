import type { AttributeValue } from "../../../types.js";
import type { Path } from "../operands/path.js";
import type { Value } from "../operands/value.js";
import type { ConditionComparisonParams } from "./comparisons.js";
import type { ConditionExpression } from "./expression.js";
import type { Size } from "./size.js";

export type ConditionParams =
  | ConditionExpression
  | ConditionComparisonParams
  | ConditionExpression;

export type ConditionOperand<T extends AttributeValue = AttributeValue> =
  | Path
  | Value<T>
  | Size;
