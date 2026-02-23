import type {
  NativeBinary,
  NativeNumber,
  NativeString,
} from "../../../types.js";
import type { Operand, OperandInput } from "../operands/operand.js";

export type ComparableValue = NativeBinary | NativeNumber | NativeString;

export type ComparableOperandInput = OperandInput<ComparableValue>;

export type ComparableOperand = Operand<ComparableValue>;
