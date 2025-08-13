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
import {
  type IOperand,
  type Operand,
  operand,
  type RawOperand,
} from "../operands/operand.js";

export type SizeOperandValue =
  | NativeBinary
  | NativeList
  | NativeMap
  | NativeSet
  | NativeString;

/**
 * This type aggregates the types of operands that can be used with the {@link size} function.
 *
 * @see size
 * @see Path
 * @see Value
 */
export type SizeOperand = Operand<SizeOperandValue>;

export type RawSizeOperand = RawOperand<SizeOperandValue>;

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
 * @param raw - The operand to calculate the size of.
 * @returns A new {@link Size} operand.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function size(raw: RawSizeOperand): Size {
  const effective = operand<SizeOperandValue>(raw);
  return Size.from(effective);
}

// TODO: module visibility
export function isSize(value: unknown): value is Size {
  return value instanceof Size;
}
