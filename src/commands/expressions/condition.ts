import type { AttributeType } from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";
import {
  AttributeOperand,
  type IOperand,
  type Operand,
  type ValueOperand,
} from "./operands.js";

// NOTES:
// A string literal in a condition is *always* a reference to an attribute path, and seems to be always valid syntax.
// For example, `begins_with(toto, tata)` is valid and checks that the attribute value toto begins with the content of the attribute tata.
// Obviously, this particular case is not useful, but there could be edge cases where this type of function call is, so we should support it.

export type ConditionOperand = Operand | SizeOperand;

// TODO: rename for serializer, and the method to be serialize.
export type Stringifier = (params: {
  names: AttributeNames;
  values: AttributeValues;
}) => string;

export interface ConditionParams {
  stringify: Stringifier;
}

export class Condition {
  private readonly stringifier: Stringifier;

  constructor(params: ConditionParams) {
    const { stringify } = params;
    this.stringifier = stringify;
  }

  // TODO: exclude from exported type definitions if possible.
  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    return this.stringifier(params);
  }

  /**
   * Returns a condition that combines this one with the provided condition using the `AND` operator.
   *
   * @param other - The other condition to combine with this one.
   *
   * @returns A {@link Condition} that evaluates to true only if both conditions evaluate to true.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
   */
  and(other: Condition): Condition {
    return condition({
      stringify: ({ names, values }) => {
        const left = this.stringify({ names, values });
        const right = other.stringify({ names, values });
        return `(${left} AND ${right})`;
      },
    });
  }

  /**
   * Returns a condition that combines this one with the provided condition using the `OR` operator.
   *
   * @param other - The other condition to combine with this one.
   *
   * @returns A {@link Condition} that evaluates to true if any conditions evaluate to true.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
   */
  or(other: Condition): Condition {
    return condition({
      stringify: ({ names, values }) => {
        const left = this.stringify({ names, values });
        const right = other.stringify({ names, values });
        return `(${left} OR ${right})`;
      },
    });
  }
}

/**
 * Negates the provided condition using the `NOT` operator.
 *
 * @param inner - The condition to negate.
 *
 * @returns A {@link Condition} that evaluates to the opposite of what the provided condition evaluates to.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.LogicalEvaluations
 */
export function not(inner: Condition): Condition {
  return condition({
    stringify: ({ names, values }) => {
      return `NOT (${inner.stringify({ names, values })})`;
    },
  });
}

// TODO: make this a static factory?
function condition(params: ConditionParams): Condition {
  return new Condition(params);
}

// NOTE: methods here means that both sides of the conditions can either be attribute names or attribute values.
export class OperandConditionBuilder<T extends Operand> {
  protected readonly operand: T;

  constructor(operand: T) {
    this.operand = operand;
  }

  /**
   * Returns a condition that uses the `begins_with` function.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand begins with the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
   */
  beginsWith(rhs: Operand<string>): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `begins_with(${this.substitute({ names, values })}, ${rhs.substitute({ names, values })})`;
      },
    });
  }

  /**
   * Returns a condition that uses the `BETWEEN` operator.
   *
   * Both bounds are inclusive, meaning that the returned condition corresponds to `lower <= this <= upper`.
   *
   * @param lower - The lower inclusive bound of the range.
   * @param upper - The upper inclusive bound of the range.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is within the provided bounds.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  // TODO: test with size operands.
  between(lower: ConditionOperand, upper: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `${this.substitute({ names, values })} BETWEEN ${lower.substitute({ names, values })} AND ${upper.substitute({ names, values })}`;
      },
    });
  }

  /**
   * Returns a condition that uses the `contains` function.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand contains the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
   */
  // TODO: test with size operands.
  contains(rhs: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `contains(${this.substitute({ names, values })}, ${rhs.substitute({ names, values })})`;
      },
    });
  }

  /**
   * Returns a condition that uses the `=` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  // TODO: this should be typed better once moved out. It accepts the interface only to make the tests compile.
  equals(rhs: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `${this.substitute({ names, values })} = ${rhs.substitute({ names, values })}`;
      },
    });
  }

  /**
   * An alias for {@link equals}.
   */
  eq = this.equals.bind(this);

  /**
   * Returns a condition that uses the `>` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is greater than the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  // TODO: test that both sides can be size manually, then add the unit tests if it makes sense.
  greaterThan(rhs: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `${this.substitute({ names, values })} > ${rhs.substitute({ names, values })}`;
      },
    });
  }

  /**
   * An alias for {@link greaterThan}.
   */
  gt = this.greaterThan.bind(this);

  /**
   * Returns a condition that uses the `>=` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is greater than or equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  // TODO: test that both sides can be size manually, then add the unit tests if it makes sense.
  greaterThanOrEquals(rhs: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `${this.substitute({ names, values })} >= ${rhs.substitute({ names, values })}`;
      },
    });
  }

  /**
   * An alias for {@link greaterThanOrEquals}
   */
  gte = this.greaterThanOrEquals.bind(this);

  /**
   * Returns a condition that uses the `IN` operator.
   *
   * @param operands - The list of operands to check against. This function throws if the list is
   * empty or contains more than 100 operands.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is equal to any of the provided ones.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  // TODO: test that both sides can be size manually, then add the unit tests if it makes sense.
  in(...operands: ConditionOperand[]): Condition {
    if (operands.length === 0) {
      throw new Error("the IN operator requires at least one operand.");
    }
    if (operands.length > 100) {
      throw new Error(
        `up to 100 operands are support for the IN operator, got ${operands.length}`,
      );
    }

    return condition({
      stringify: ({ names, values }) => {
        const operandsString = operands
          .map((operand) => operand.substitute({ names, values }))
          .join(",");
        return `${this.substitute({ names, values })} IN (${operandsString})`;
      },
    });
  }

  /**
   * Returns a condition that uses the `<` operator
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is lower than the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  // TODO: test that both sides can be size manually, then add the unit tests if it makes sense.
  lowerThan(rhs: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `${this.substitute({ names, values })} < ${rhs.substitute({ names, values })}`;
      },
    });
  }

  /**
   * An alias for {@link lowerThan}.
   */
  lt = this.lowerThan.bind(this);

  /**
   * Returns a condition that uses the `<=` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is lower than or equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  //TODO: test that both sides can be size manually, then add the unit tests if it makes sense.
  lowerThanOrEquals(rhs: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `${this.substitute({ names, values })} <= ${rhs.substitute({ names, values })}`;
      },
    });
  }

  /**
   * An alias for {@link lowerThanOrEquals}
   */
  lte = this.lowerThanOrEquals.bind(this);

  /**
   * Returns a condition that uses the `<>` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns A {@link Condition} that evaluates to true if this operand is not equal to the provided one.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Comparators
   */
  notEquals(rhs: ConditionOperand): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `${this.substitute({ names, values })} <> ${rhs.substitute({ names, values })}`;
      },
    });
  }

  /**
   * An alias for {@link notEquals}.
   */
  ne = this.notEquals.bind(this);

  protected substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    return this.operand.substitute(params);
  }
}

// A specialized class with more capabilities.
export class AttributeConditionBuilder extends OperandConditionBuilder<AttributeOperand> {
  /**
   * @returns A {@link Condition} that evaluates to true if the provided attribute path exists.
   */
  // NOTE: the left hand side of this condition can only be a literal value (tested)
  exists(): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `attribute_exists(${this.substitute({ names, values })})`;
      },
    });
  }

  /**
   * @returns A {@link Condition} that evaluates to true if the provided attribute path does not exist.
   */
  // NOTE: the left hand side of this condition can only be a literal value (tested)
  notExists(): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `attribute_not_exists(${this.substitute({ names, values })})`;
      },
    });
  }

  /**
   * @param type - The type to check against.
   * @returns A {@link Condition} that evaluates to true if there exists an attribute at
   * the provided path of the given type.
   */
  // NOTE: the left hand side of this condition *can be* an attribute value pointing to a valid path.
  // NOTE: the right hand side of this condition *must be* an condition attribute (not a literal).
  isType(type: ValueOperand<AttributeType>): Condition {
    return condition({
      stringify: ({ names, values }) => {
        return `attribute_type(${this.substitute({ names, values })}, ${type.substitute({ names, values })})`;
      },
    });
  }
}

export function where(attrribute: AttributeOperand): AttributeConditionBuilder;
export function where(
  operand: Exclude<Operand, AttributeOperand>,
): OperandConditionBuilder<Exclude<Operand, AttributeOperand>>;
export function where(operand: Operand): OperandConditionBuilder<Operand> {
  if (operand instanceof AttributeOperand) {
    return new AttributeConditionBuilder(operand);
  }
  return new OperandConditionBuilder(operand);
}

// TODO: type this as a "value operand" of type number if possiburu or useful?
export class SizeOperand implements IOperand {
  private readonly inner: Operand;

  constructor(operand: Operand) {
    this.inner = operand;
  }

  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    return `size(${this.inner.substitute(params)})`;
  }
}

export function size(operand: Operand): SizeOperand {
  return new SizeOperand(operand);
}
