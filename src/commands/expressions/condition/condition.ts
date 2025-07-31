import type { AttributeValue } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IExpression } from "../expression.js";
import type { PathOperand } from "../operands/path.js";
import type { ValueOperand } from "../operands/value.js";
import type { ConditionComparisonParams } from "./comparisons.js";
import { type ConditionExpression, conditionExpression } from "./expression.js";
import type { Size } from "./size.js";

export type ConditionParams =
  | ConditionExpression
  | ConditionComparisonParams
  | ConditionExpression;

export type ConditionOperand<T extends AttributeValue = AttributeValue> =
  | PathOperand
  | ValueOperand<T>
  | Size;

// TODO: remove/rename?
export class Condition implements IExpression {
  private readonly inner: ConditionExpression;

  private constructor(params: ConditionExpression) {
    this.inner = params;
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    return this.inner.stringify(params);
  }

  /**
   * @private
   */
  static from(params: ConditionParams): Condition {
    return new Condition(conditionExpression(params));
  }
}

// TODO: not meant to be exported publicly.
export function condition(params: ConditionParams): Condition {
  return Condition.from(params);
}
