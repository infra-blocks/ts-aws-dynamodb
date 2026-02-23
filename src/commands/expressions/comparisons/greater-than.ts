import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../formatter.js";
import {
  isOperandInput,
  type Operand,
  type OperandInput,
} from "../operands/index.js";
import { binaryOperation } from "./binary.js";
import type { ComparableValue } from "./comparable.js";

export type GreaterThanInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
> = [OI, ">", OI];

export function isGreaterThanInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
>(value: unknown): value is GreaterThanInput<OI> {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    isOperandInput(value[0]) &&
    value[1] === ">" &&
    isOperandInput(value[1])
  );
}

export type GreaterThan<
  O extends Operand<ComparableValue> = Operand<ComparableValue>,
> = ExpressionFormatter & Brand<"GreaterThan"> & Phantom<O>;

export const GreaterThan = {
  /**
   * Returns a condition that uses the `>` operator.
   *
   * @param input - The parameters of the `>` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link GreaterThan} that evaluates to true if this operand is greater than or equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from<
    OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
    O extends Operand<ComparableValue> = Operand<ComparableValue>,
  >(input: GreaterThanInput<OI>): GreaterThan<O> {
    return trusted(binaryOperation(input));
  },
};
