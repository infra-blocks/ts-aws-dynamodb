import { type Brand, type Phantom, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../formatter.js";
import {
  isOperandInput,
  Operand,
  type OperandInput,
} from "../operands/operand.js";
import type { ComparableValue } from "./comparable.js";

export type InInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
> = [OI, "IN", OI[]];

export function isInInput<
  OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
>(value: unknown): value is InInput<OI> {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    isOperandInput(value[0]) &&
    value[1] === "IN" &&
    isOperandInput(value[1])
  );
}

export type In<O extends Operand<ComparableValue> = Operand<ComparableValue>> =
  ExpressionFormatter & Brand<"In"> & Phantom<O>;

export const In = {
  /**
   * Returns a condition that uses the `IN` operator.
   *
   * This function throws if the list of elements to compared against is empty or exceeds 100 elements.
   *
   * @param input - The parameters of the `IN` comparison. The first element contains the left-hand side operand,
   * the third element contains the list of elements to compare against.
   *
   * @returns An {@link In} that evaluates to true if this operand is equal to any of the provided ones.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  from<
    O extends Operand<ComparableValue> = Operand<ComparableValue>,
    OI extends OperandInput<ComparableValue> = OperandInput<ComparableValue>,
  >(input: InInput<OI>): In<O> {
    // TODO: unit test those limits
    if (input[2].length === 0) {
      throw new Error(
        "the IN operator requires at least one value in rhs operand.",
      );
    }
    if (input[2].length > 100) {
      throw new Error(
        `up to 100 values are support for the rhs operand of the IN operator, got ${input[2].length}`,
      );
    }

    const element = Operand.normalize<ComparableValue>(input[0]);
    const elements = input[2].map(Operand.normalize<ComparableValue>);
    return trusted(
      ExpressionFormatter.from(({ names, values }) => {
        return `${element.format({ names, values })} IN (${elements
          .map((operand) => operand.format({ names, values }))
          .join(",")})`;
      }),
    );
  },
};
