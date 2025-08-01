import type { NativeBinary, NativeString, NativeType } from "../../../types.js";
import { Path, type RawPath } from "../operands/path.js";
import type { Value } from "../operands/value.js";
import { ConditionExpression } from "./expression.js";
import type { Size } from "./size.js";

/**
 * Returns a condition that uses the `attribute_exists` function.
 *
 * @param rawPath - The attribute path to check for existence.
 * @returns A {@link ConditionExpression} that evaluates to true if the provided attribute path exists.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeExists(rawPath: RawPath): ConditionExpression {
  const path = Path.normalize(rawPath);
  return ConditionExpression.from({
    stringify: ({ names }) => `attribute_exists(${path.substitute({ names })})`,
  });
}

/**
 * Returns a condition that uses the `attribute_not_exists` function.
 *
 * @param rawPath - The attribute path to check for non-existence.
 * @returns A {@link ConditionExpression} that evaluates to true if the provided attribute path does not exist.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeNotExists(rawPath: RawPath): ConditionExpression {
  const path = Path.normalize(rawPath);
  return ConditionExpression.from({
    stringify: ({ names }) =>
      `attribute_not_exists(${path.substitute({ names })})`,
  });
}

/**
 * Returns a condition that uses the `attribute_type` function.
 *
 * @param attribute - The attribute path to check.
 * @param type - The expected type of the attribute.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if the attribute is of the expected type.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeType(
  attribute: RawPath,
  type: Value<NativeType>,
): ConditionExpression {
  const path = Path.normalize(attribute);
  return ConditionExpression.from({
    stringify: ({ names, values }) =>
      `attribute_type(${path.substitute({ names })}, ${type.substitute({ values })})`,
  });
}

/**
 * This type aggregates the types of operands that can be used with the {@link beginsWith} function.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export type BeginsWithOperand = Path | Value<NativeString | NativeBinary>;

/**
 * Returns a condition that uses the `begins_with` function.
 *
 * @param first - The first function operand, which is the attribute or value to check.
 * @param second - The second function operand, which is the prefix to validate against.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if the first operand begins with the second.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function beginsWith(
  first: BeginsWithOperand,
  second: BeginsWithOperand,
): ConditionExpression {
  return ConditionExpression.from({
    stringify: ({ names, values }) =>
      `begins_with(${first.substitute({ names, values })}, ${second.substitute({ names, values })})`,
  });
}

// TODO: type better on the lhs/rhs?
/**
 * This type aggregates the types of operands that can be used as the first operand of the {@link contains} function.
 */
export type ContainsFirstOperand = Path | Value;
/**
 * This type aggregates the types of operands that can be used as the second operand of the {@link contains} function.
 */
export type ContainsSecondOperand = Path | Value | Size;

/**
 * Returns a condition that uses the `contains` function.
 *
 * @param first - The first function operand, which is the attribute or value to check.
 * @param second - The second function operand, which is the value to check for containment.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand contains the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function contains(
  first: ContainsFirstOperand,
  second: ContainsSecondOperand,
): ConditionExpression {
  return ConditionExpression.from({
    stringify: ({ names, values }) =>
      `contains(${first.substitute({ names, values })}, ${second.substitute({ names, values })})`,
  });
}
