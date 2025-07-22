import type { AttributeValue } from "../../../types.js";
import {
  isLoosePathOperand,
  isPathOperand,
  type LoosePathOperand,
  type PathOperand,
  type PathOperandParams,
  path,
} from "./path.js";
import {
  isLooseValueOperand,
  isValueOperand,
  type LooseValueOperand,
  type ValueOperand,
  type ValueOperandParams,
  value,
} from "./value.js";

export type Operand<T extends AttributeValue = AttributeValue> =
  | PathOperand
  | ValueOperand<T>;

export type LooseOperand<T extends AttributeValue = AttributeValue> =
  | LoosePathOperand
  | LooseValueOperand<T>;

export type OperandParams<T extends AttributeValue = AttributeValue> =
  | PathOperandParams
  | ValueOperandParams<T>;

export function operand<T extends AttributeValue = AttributeValue>(
  param: OperandParams<T>,
): Operand<T> {
  if (isLoosePathOperand(param) || isPathOperand(param)) {
    return path(param);
  }
  if (isLooseValueOperand(param) || isValueOperand(param)) {
    return value(param);
  }
  throw new TypeError(`unknown operand type: ${param}`);
}
