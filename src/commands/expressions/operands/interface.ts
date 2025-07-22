import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";

export interface IOperand {
  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string;
}
