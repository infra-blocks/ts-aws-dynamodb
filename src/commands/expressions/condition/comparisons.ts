import { unreachable } from "@infra-blocks/types";
import type {
  NativeBinary,
  NativeNumber,
  NativeString,
} from "../../../types.js";
import type { IOperand, Operand } from "../operands/type.js";
import type { ConditionOperand, ConditionParams } from "./condition.js";
import { ConditionExpression } from "./expression.js";

export type ComparableValue = NativeBinary | NativeNumber | NativeString;
export type ComparableOperand = ConditionOperand<ComparableValue>;

export type ConditionComparisonParams =
  | Between
  | Equals
  | GreaterThan
  | GreaterThanOrEquals
  | In
  | LowerThan
  | LowerThanOrEquals
  | NotEquals;

export type Between = [
  ComparableOperand,
  "BETWEEN",
  ComparableOperand,
  "AND",
  ComparableOperand,
];

// TODO: test that lhs can also be a size function IRL on all these comparisons.
export type Equals = [ConditionOperand, "=", ConditionOperand];
export type GreaterThan = [ComparableOperand, ">", ComparableOperand];
export type GreaterThanOrEquals = [ComparableOperand, ">=", ComparableOperand];
export type In = [ComparableOperand, "IN", ComparableOperand[]];
export type LowerThan = [ComparableOperand, "<", ComparableOperand];
export type LowerThanOrEquals = [ComparableOperand, "<=", ComparableOperand];
export type NotEquals = [ConditionOperand, "<>", ConditionOperand];

// TODO: don't export publicly through index.
export function comparison(
  params: ConditionComparisonParams,
): ConditionExpression {
  if (isBetween(params)) {
    return between(params);
  }
  if (isEquals(params)) {
    return equals(params);
  }
  if (isGreaterThan(params)) {
    return greaterThan(params);
  }
  if (isGreaterThanOrEquals(params)) {
    return greaterThanOrEquals(params);
  }
  if (isIn(params)) {
    return inComparison(params);
  }
  if (isLowerThan(params)) {
    return lowerThan(params);
  }
  if (isLowerThanOrEquals(params)) {
    return lowerThanOrEquals(params);
  }
  if (isNotEquals(params)) {
    return notEquals(params);
  }
  unreachable(params);
}

export function isComparison(
  params: ConditionParams,
): params is ConditionComparisonParams {
  const casted = params as ConditionComparisonParams;
  return (
    isBetween(casted) ||
    isEquals(casted) ||
    isGreaterThan(casted) ||
    isGreaterThanOrEquals(casted) ||
    isIn(casted) ||
    isLowerThan(casted) ||
    isLowerThanOrEquals(casted) ||
    isNotEquals(casted)
  );
}

/**
 * Returns a condition that uses the `BETWEEN` operator.
 *
 * Both bounds are inclusive, meaning that the returned condition corresponds to `lower <= lhs <= upper`.
 *
 * @param params - The parameters of the `BETWEEN` comparison. The first element contains the left-hand side operand,
 * the third element contains the lower inclusive bound, and the fifth element contains the upper inclusive bound.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is within the provided bounds.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function between(params: Between): ConditionExpression {
  return ConditionExpression.from({
    stringify: ({ names, values }) => {
      return `${params[0].substitute({ names, values })} BETWEEN ${params[2].substitute({ names, values })} AND ${params[4].substitute({ names, values })}`;
    },
  });
}

function isBetween(value: ConditionComparisonParams): value is Between {
  return value[1] === "BETWEEN" && value[3] === "AND";
}

/**
 * Returns a condition that uses the `=` operator.
 *
 * @param params - The parameters of the `=` comparison. The first element contains the left-hand side operand,
 * and the third element contains the right-hand side operand.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is equal to the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function equals(params: Equals): ConditionExpression {
  return binaryOperation(params);
}

function isEquals(value: ConditionComparisonParams): value is Equals {
  return value[1] === "=";
}

/**
 * Returns a condition that uses the `>` operator.
 *
 * @param params - The parameters of the `>` comparison. The first element contains the left-hand side operand,
 * the third element contains the right-hand side operand.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is greater than the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function greaterThan(params: GreaterThan): ConditionExpression {
  return binaryOperation(params);
}

function isGreaterThan(value: ConditionComparisonParams): value is GreaterThan {
  return value[1] === ">";
}

/**
 * Returns a condition that uses the `>=` operator.
 *
 * @param params - The parameters of the `>=` comparison. The first element contains the left-hand side operand,
 * the third element contains the right-hand side operand.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is greater than or equal to the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function greaterThanOrEquals(params: GreaterThanOrEquals): ConditionExpression {
  return binaryOperation(params);
}

function isGreaterThanOrEquals(
  value: ConditionComparisonParams,
): value is GreaterThanOrEquals {
  return value[1] === ">=";
}

/**
 * Returns a condition that uses the `IN` operator.
 *
 * This function throws if the list of elements to compared against is empty or exceeds 100 elements.
 *
 * @param params - The parameters of the `IN` comparison. The first element contains the left-hand side operand,
 * the third element contains the list of elements to compare against.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is equal to any of the provided ones.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function inComparison(params: In): ConditionExpression {
  const containerElements = params[2];
  // TODO: unit test those limits
  if (containerElements.length === 0) {
    throw new Error("the IN operator requires at least one operand.");
  }
  if (containerElements.length > 100) {
    throw new Error(
      `up to 100 operands are support for the IN operator, got ${containerElements.length}`,
    );
  }

  return ConditionExpression.from({
    stringify: ({ names, values }) => {
      const operands = containerElements
        .map((operand) => (operand as Operand).substitute({ names, values }))
        .join(",");
      return `${params[0].substitute({ names, values })} IN (${operands})`;
    },
  });
}

function isIn(value: ConditionComparisonParams): value is In {
  return value[1] === "IN";
}

/**
 * Returns a condition that uses the `<` operator
 *
 * @param params - The parameters of the `<` comparison. The first element contains the left-hand side operand,
 * the third element contains the right-hand side operand.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is lower than the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function lowerThan(params: LowerThan): ConditionExpression {
  return binaryOperation(params);
}

function isLowerThan(value: ConditionComparisonParams): value is LowerThan {
  return value[1] === "<";
}

/**
 * Returns a condition that uses the `<=` operator.
 *
 * @param params - The parameters of the `<=` comparison. The first element contains the left-hand side operand,
 * the third element contains the right-hand side operand.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is lower than or equal to the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function lowerThanOrEquals(params: LowerThanOrEquals): ConditionExpression {
  return binaryOperation(params);
}

function isLowerThanOrEquals(
  value: ConditionComparisonParams,
): value is LowerThanOrEquals {
  return value[1] === "<=";
}

/**
 * Returns a condition that uses the `<>` operator.
 *
 * @param params - The parameters of the `<>` comparison. The first element contains the left-hand side operand,
 * the third element contains the right-hand side operand.
 *
 * @returns A {@link ConditionExpression} that evaluates to true if this operand is not equal to the provided one.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
 */
function notEquals(params: NotEquals): ConditionExpression {
  return binaryOperation(params);
}

function isNotEquals(value: ConditionComparisonParams): value is NotEquals {
  return value[1] === "<>";
}

function binaryOperation(
  params: [IOperand, string, IOperand],
): ConditionExpression {
  return ConditionExpression.from({
    stringify: ({ names, values }) => {
      return `${params[0].substitute({ names, values })} ${params[1]} ${params[2].substitute({ names, values })}`;
    },
  });
}
