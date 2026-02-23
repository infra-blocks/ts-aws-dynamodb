import { type Brand, trusted } from "@infra-blocks/types";
import type {
  NativeBinary,
  NativeList,
  NativeMap,
  NativeSet,
  NativeString,
} from "../../../types.js";
import { ExpressionFormatter, isExpressionFormatter } from "../formatter.js";
import { PathOrValue, type PathOrValueInput } from "./path-or-value.js";

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
export type SizeOperand = PathOrValue<SizeOperandValue>;

export type SizeOperandInput = PathOrValueInput<SizeOperandValue>;

export type Size = ExpressionFormatter &
  Brand<"Size"> & { readonly type: "Size" };

export const Size = {
  from(operand: SizeOperand): Size {
    return trusted({
      type: "Size",
      ...ExpressionFormatter.from(
        (params) => `size(${operand.format(params)})`,
      ),
    });
  },
};

/**
 * Creates a new {@link Size} operand to be nested in expressions.
 *
 * @param input - The operand to calculate the size of.
 * @returns A new {@link Size} operand.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function size(input: SizeOperandInput): Size {
  const effective = PathOrValue.normalize<SizeOperandValue>(input);
  return Size.from(effective);
}

export function isSize(value: unknown): value is Size {
  return (
    isExpressionFormatter(value) && "type" in value && value.type === "Size"
  );
}
