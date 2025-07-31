import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IExpression, Stringifier } from "../expression.js";
import { comparison, isComparison } from "./comparisons.js";
import type { ConditionParams } from "./condition.js";

export class ConditionExpression implements IExpression {
  private readonly stringifier: Stringifier;

  private constructor(stringifier: Stringifier) {
    this.stringifier = stringifier;
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return this.stringifier({ names, values });
  }

  /**
   * @private
   */
  static from(params: { stringify: Stringifier }): ConditionExpression {
    const { stringify } = params;
    return new ConditionExpression(stringify);
  }
}

// TODO: module visibility.
export function conditionExpression(
  params: ConditionParams,
): ConditionExpression {
  return isComparison(params) ? comparison(params) : params;
}
