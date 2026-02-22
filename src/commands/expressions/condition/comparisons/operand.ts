import type {
  NativeBinary,
  NativeNumber,
  NativeString,
} from "../../../../types.js";
import type { RawConditionOperand } from "../operand.js";

export type ComparableValue = NativeBinary | NativeNumber | NativeString;
// TODO: this will have to be reviewed to narrow key condition expressions, as they can't use the size function (to be tested with the API though).
export type ComparableOperand = RawConditionOperand<ComparableValue>;
