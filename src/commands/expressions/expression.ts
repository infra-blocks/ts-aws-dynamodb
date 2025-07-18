import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";

export interface IExpression {
  stringify(params: { names: AttributeNames; values: AttributeValues }): string;
}
