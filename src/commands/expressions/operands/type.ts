import type { AttributeValue } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { Path } from "./path.js";
import type { Value } from "./value.js";

export type Operand<T extends AttributeValue = AttributeValue> =
  | Path
  | Value<T>;
export interface IOperand {
  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string;
}
