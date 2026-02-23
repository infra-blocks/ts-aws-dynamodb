import { type Brand, trusted } from "@infra-blocks/types";
import type { NativeBinary, NativeString } from "../../../types.js";
import { ExpressionFormatter } from "../formatter.js";
import {
  PathOrValue,
  type PathOrValueInput,
} from "../operands/path-or-value.js";

/**
 * This type aggregates the types of operands that can be used with the {@link beginsWith} function.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export type BeginsWithOperand = PathOrValueInput<StringOrBinary>;

export type BeginsWith = ExpressionFormatter & Brand<"BeginsWith">;

/**
 * Returns a condition that uses the `begins_with` function.
 *
 * @param first - The first function operand, which is the path or value to check.
 * @param second - The second function operand, which is the prefix to validate against.
 *
 * @returns A {@link BeginsWith} that evaluates to true if the first operand begins with the second.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function beginsWith(
  first: BeginsWithOperand,
  second: BeginsWithOperand,
): BeginsWith {
  const firstOperand = PathOrValue.normalize<StringOrBinary>(first);
  const secondOperand = PathOrValue.normalize<StringOrBinary>(second);

  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `begins_with(${firstOperand.format({ names, values })}, ${secondOperand.format({ names, values })})`,
    ),
  );
}

type StringOrBinary = NativeString | NativeBinary;
