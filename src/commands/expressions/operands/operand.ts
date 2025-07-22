import type { AttributeValue } from "../../../types.js";
import { isLoosePath, isPathOperand, type PathOperand, path } from "./path.js";
import {
  isLooseValue,
  isValueOperand,
  type ValueOperand,
  value,
} from "./value.js";

export type Operand<T extends AttributeValue = AttributeValue> =
  | PathOperand
  | ValueOperand<T>;

export type LooseOperand = AttributeValue;

export function operand<T extends AttributeValue = AttributeValue>(
  param: T | PathOperand | ValueOperand<T>,
): Operand<T> {
  if (isPathOperand(param)) {
    return param;
  }
  if (isLoosePath(param)) {
    return path(param);
  }
  if (isValueOperand<T>(param)) {
    return param;
  }
  if (isLooseValue(param)) {
    return value(param);
  }
  throw new TypeError(`unknown operand type: ${param}`);
}
