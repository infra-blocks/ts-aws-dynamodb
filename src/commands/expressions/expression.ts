import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";

export type Stringifier = (params: {
  names: AttributeNames;
  values: AttributeValues;
}) => string;

export interface IExpression {
  stringify(params: { names: AttributeNames; values: AttributeValues }): string;
}
