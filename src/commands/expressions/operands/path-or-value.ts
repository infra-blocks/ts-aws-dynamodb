import assert from "node:assert";
import type { AttributeValue } from "../../../types.js";
import {
  type ImplicitPath,
  isPathInput,
  Path,
  type PathInput,
} from "./path.js";
import {
  type ImplicitValue,
  isValueInput,
  Value,
  type ValueInput,
} from "./value.js";

export type ImplicitPathOrValue = ImplicitPath | ImplicitValue;

// TODO: should be named OperandParams/Input to follow the conventions.
export type PathOrValueInput<T extends AttributeValue = AttributeValue> =
  | PathInput
  | ValueInput<T>;

export type PathOrValue<T extends AttributeValue = AttributeValue> =
  | Path
  | Value<T>;

export const PathOrValue = {
  normalize<T extends AttributeValue = AttributeValue>(
    input: PathOrValueInput<T>,
  ): PathOrValue<T> {
    if (isPathInput(input)) {
      return Path.normalize(input);
    }
    if (isValueInput<T>(input)) {
      return Value.normalize(input);
    }
    assert(false, `unexpected operand: ${input}`);
  },
};
