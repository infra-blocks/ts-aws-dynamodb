import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import type { AttributeValue } from "../../../types.js";
import type { ExpressionFormatter } from "../formatter.js";
import {
  isOperandInput,
  type Operand,
  type OperandInput,
} from "../operands/index.js";
import { binaryOperation } from "./binary.js";

export type EqualsInput<
  OI extends OperandInput<AttributeValue> = OperandInput<AttributeValue>,
> = [OI, "=", OI];

export function isEqualsInput<
  OI extends OperandInput<AttributeValue> = OperandInput<AttributeValue>,
>(value: unknown): value is EqualsInput<OI> {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    isOperandInput(value[0]) &&
    value[1] === "=" &&
    isOperandInput(value[1])
  );
}

export type Equals<
  O extends Operand<AttributeValue> = Operand<AttributeValue>,
> = ExpressionFormatter & Brand<"Equals"> & Phantom<O>;

export const Equals = {
  /**
   * Returns a condition that uses the `=` operator.
   *
   * @param input - The parameters of the `=` comparison. The first element contains the left-hand side operand,
   * and the third element contains the right-hand side operand.
   *
   * @returns An {@link Equals} that evaluates to true if this operand is equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from<
    O extends Operand<AttributeValue>,
    OI extends OperandInput<AttributeValue>,
  >(input: EqualsInput<OI>): Equals<O> {
    return trusted(binaryOperation(input));
  },
};
