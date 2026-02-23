import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../formatter.js";
import {
  isOperandInput,
  Operand,
  type OperandInput,
} from "../operands/index.js";
import type { ComparableValue } from "./comparable.js";

export type BetweenInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
> = [OI, "BETWEEN", OI, "AND", OI];

export function isBetweenInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
>(value: unknown): value is BetweenInput<OI> {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    isOperandInput(value[0]) &&
    value[1] === "BETWEEN" &&
    isOperandInput(value[2]) &&
    value[3] === "AND" &&
    isOperandInput(value[4])
  );
}

export type Between<
  O extends Operand<ComparableValue> = Operand<ComparableValue>,
> = ExpressionFormatter & Brand<"Between"> & Phantom<O>;

export const Between = {
  /**
   * Returns a comparison that uses the `BETWEEN` operator.
   *
   * Both bounds are inclusive.
   *
   * @param input - The parameters of the `BETWEEN` comparison. The first element contains the left-hand side operand,
   * the third element contains the lower inclusive bound, and the fifth element contains the upper inclusive bound.
   *
   * @returns A {@link Between} that evaluates to true if this operand is within the provided bounds.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from<
    O extends Operand<ComparableValue>,
    OI extends OperandInput<ComparableValue>,
  >(input: BetweenInput<OI>): Between<O> {
    const lhs = Operand.normalize<ComparableValue>(input[0]);
    const lower = Operand.normalize<ComparableValue>(input[2]);
    const upper = Operand.normalize<ComparableValue>(input[4]);

    return trusted(
      ExpressionFormatter.from(
        ({ names, values }) =>
          `${lhs.format({ names, values })} BETWEEN ${lower.format({ names, values })} AND ${upper.format({ names, values })}`,
      ),
    );
  },
};
