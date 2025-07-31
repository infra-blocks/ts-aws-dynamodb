import type {
  NativeBinary,
  NativeList,
  NativeMap,
  NativeSet,
  NativeString,
} from "../../../types.js";
import type {
  AttributeNames,
  AttributeValues,
} from "../../attributes/index.js";
import type { Path } from "../operands/path.js";
import type { IOperand } from "../operands/type.js";
import type { Value } from "../operands/value.js";

/**
 * This type aggregates the types of operands that can be used with the {@link size} function.
 *
 * @see size
 * @see Path
 * @see Value
 */
export type SizeOperand =
  | Path
  | Value<NativeBinary | NativeList | NativeMap | NativeSet | NativeString>;

/**
 * A type representing the result of the {@link size} function as an operand to be used in expressions.
 */
export class Size implements IOperand {
  private readonly inner: SizeOperand;

  constructor(operand: SizeOperand) {
    this.inner = operand;
  }

  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    return `size(${this.inner.substitute(params)})`;
  }

  /**
   * @private
   */
  static from(operand: SizeOperand): Size {
    return new Size(operand);
  }
}

/**
 * Creates a new {@link Size} operand to be nested in expressions.
 *
 * @param operand - The operand to calculate the size of.
 * @returns A new {@link Size} operand.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function size(operand: SizeOperand): Size {
  return Size.from(operand);
}
