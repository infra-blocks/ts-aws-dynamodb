import type {
  AttributeValue,
  NativeBinary,
  NativeString,
  NativeType,
} from "../../../types.js";
import { operand, type RawOperand } from "../operands/operand.js";
import { Path, type RawPath } from "../operands/path.js";
import { type RawValue, Value } from "../operands/value.js";
import { conditionOperand, type RawConditionOperand } from "./condition.js";
import { ConditionExpression } from "./expression.js";

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
 * @param rawType - The expected type of the attribute.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if the attribute is of the expected type.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeType(
  attribute: RawPath,
  rawType: RawValue<NativeType>,
): ConditionExpression {
  const path = Path.normalize(attribute);
  const type = Value.normalize(rawType);
  return ConditionExpression.from({
    stringify: ({ names, values }) =>
      `attribute_type(${path.substitute({ names })}, ${type.substitute({ values })})`,
  });
}

// TODO: make a type for string + binary and use it in the function implementation.
/**
 * This type aggregates the types of operands that can be used with the {@link beginsWith} function.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export type BeginsWithOperand = RawOperand<NativeString | NativeBinary>;

/**
 * Returns a condition that uses the `begins_with` function.
 *
 * @param first - The first function operand, which is the path or value to check.
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
  const firstOperand = operand<NativeString | NativeBinary>(first);
  const secondOperand = operand<NativeString | NativeBinary>(second);

  return ConditionExpression.from({
    stringify: ({ names, values }) =>
      `begins_with(${firstOperand.substitute({ names, values })}, ${secondOperand.substitute({ names, values })})`,
  });
}

/**
 * This type aggregates the types of operands that can be used as the first operand of the {@link contains} function.
 */
export type ContainsFirstOperand = RawOperand;
/**
 * This type aggregates the types of operands that can be used as the second operand of the {@link contains} function.
 */
export type ContainsSecondOperand = RawConditionOperand;

/**
 * Returns a condition that uses the `contains` function.
 *
 * @param first - The first function operand, which is the path or value to check.
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
  const firstOperand = operand<AttributeValue>(first);
  const secondOperand = conditionOperand<AttributeValue>(second);

  return ConditionExpression.from({
    stringify: ({ names, values }) =>
      `contains(${firstOperand.substitute({ names, values })}, ${secondOperand.substitute({ names, values })})`,
  });
}
