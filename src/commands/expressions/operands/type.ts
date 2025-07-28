import type { AttributeValue } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { PathOperand } from "./path.js";
import type { ValueOperand } from "./value.js";

export type Operand<T extends AttributeValue = AttributeValue> =
  | PathOperand
  | ValueOperand<T>;
export interface IOperand {
  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string;
}
