import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";

export interface Expression {
  stringify(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string;
}
