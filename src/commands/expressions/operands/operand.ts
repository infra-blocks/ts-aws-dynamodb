import assert from "node:assert";
import type { AttributeValue } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import { type ImplicitPath, isRawPath, Path, type RawPath } from "./path.js";
import {
  type ImplicitValue,
  isRawValue,
  type RawValue,
  Value,
} from "./value.js";

export type ImplicitOperand = ImplicitPath | ImplicitValue;

export type RawOperand<T extends AttributeValue = AttributeValue> =
  | RawPath
  | RawValue<T>;

export type Operand<T extends AttributeValue = AttributeValue> =
  | Path
  | Value<T>;

export interface IOperand {
  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string;
}

export function operand<T extends AttributeValue = AttributeValue>(
  raw: RawOperand<T>,
): Operand<T> {
  if (isRawPath(raw)) {
    return Path.normalize(raw);
  }
  if (isRawValue<T>(raw)) {
    return Value.normalize(raw);
  }
  assert(false, `unexpected operand: ${raw}`);
}
