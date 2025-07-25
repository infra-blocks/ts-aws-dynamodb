import type { AttributeValue } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { AttributeOperand } from "./name.js";
import type { ValueOperand } from "./value.js";

export type Operand<T extends AttributeValue = AttributeValue> =
  | AttributeOperand
  | ValueOperand<T>;
export interface IOperand {
  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string;
}
