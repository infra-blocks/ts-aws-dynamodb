import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import type { ExpressionFormatter } from "../formatter.js";
import {
  isOperandInput,
  type Operand,
  type OperandInput,
} from "../operands/index.js";
import { binaryOperation } from "./binary.js";
import type { ComparableValue } from "./comparable.js";

export type GreaterThanOrEqualsInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
> = [OI, ">=", OI];

export function isGreaterThanOrEqualsInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
>(value: unknown): value is GreaterThanOrEqualsInput<OI> {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    isOperandInput(value[0]) &&
    value[1] === ">=" &&
    isOperandInput(value[1])
  );
}

export type GreaterThanOrEquals<
  O extends Operand<ComparableValue> = Operand<ComparableValue>,
> = ExpressionFormatter & Brand<"GreaterThanOrEquals"> & Phantom<O>;

export const GreaterThanOrEquals = {
  /**
   * Returns a condition that uses the `>=` operator.
   *
   * @param input - The parameters of the `>=` comparison. The first element contains the left-hand side operand,
   * the third element contains the right-hand side operand.
   *
   * @returns A {@link GreaterThanOrEquals} that evaluates to true if this operand is greater than or equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from<
    OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
    O extends Operand<ComparableValue> = Operand<ComparableValue>,
  >(input: GreaterThanOrEqualsInput<OI>): GreaterThanOrEquals<O> {
    return trusted(binaryOperation(input));
  },
};
