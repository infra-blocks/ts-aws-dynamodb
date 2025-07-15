import type {
  AttributePath,
  AttributeType,
  AttributeValue,
} from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";

// NOTES:
// A string literal in an expression is *always* a reference to an attribute path, and seems to be always valid syntax.
// For example, `begins_with(toto, tata)` is valid and checks that the attribute value toto begins with the content of the attribute tata.
// Obviously, this particular case is not useful, but there could be edge cases where this type of function call is, so we should support it.

// TODO: rename for serializer, and the method to be serialize.
export type Stringifier = (params: {
  attributeNames: AttributeNames;
  attributeValues: AttributeValues;
}) => string;

export interface ExpressionParams {
  stringify: Stringifier;
}

// TODO: once we have a working structure, retype everything so that it's type safe for condition expression vs key condition expression vs update expression.
export class Expression {
  private readonly stringifier: Stringifier;

  constructor(params: ExpressionParams) {
    const { stringify } = params;
    this.stringifier = stringify;
  }

  /**
   * Returns an expression that combines this one with the provided expression using the `AND` operator.
   *
   * @param other - The other expression to combine with this one.
   * @returns An {@link Expression} that is true only if both expressions are true.
   */
  and(other: Expression): Expression {
    return new Expression({
      stringify: ({ attributeNames, attributeValues }) => {
        const left = this.stringify({ attributeNames, attributeValues });
        const right = other.stringify({ attributeNames, attributeValues });
        return `(${left} AND ${right})`;
      },
    });
  }

  /**
   * Returns an expression that combines this one with the provided expression using the `OR` operator.
   *
   * @param other - The other expression to combine with this one.
   * @returns An {@link Expression} that is true if any of the expressions is true.
   */
  or(other: Expression): Expression {
    return new Expression({
      stringify: ({ attributeNames, attributeValues }) => {
        const left = this.stringify({ attributeNames, attributeValues });
        const right = other.stringify({ attributeNames, attributeValues });
        return `(${left} OR ${right})`;
      },
    });
  }

  stringify(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    return this.stringifier(params);
  }
}

export function expression(params: ExpressionParams): Expression {
  return new Expression(params);
}

/**
 * Negates the provided expression using the `NOT` operator.
 *
 * @param expression - The expression to negate.
 * @returns An {@link Expression} that corresponds to the negation the provided expression.
 */
export function not(expression: Expression): Expression {
  return new Expression({
    stringify: ({ attributeNames, attributeValues }) => {
      return `NOT (${expression.stringify({ attributeNames, attributeValues })})`;
    },
  });
}

export abstract class Operand {
  protected constructor() {}

  // NOTE: both sides of this expression can either be attribute names or attribute values.
  beginsWith(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `begins_with(${this.substitute({ attributeNames, attributeValues })}, ${rhs.substitute({ attributeNames, attributeValues })})`;
      },
    });
  }

  /**
   * Returns an expression that checks if this operand is between the two provided ones using the `BETWEEN` operator.
   *
   * Both bounds are inclusive, meaning that the returned expression corresponds to `lower <= this <= upper`.
   *
   * @param lower - The lower inclusive bound of the range.
   * @param upper - The upper inclusive bound of the range.
   *
   * @returns An {@link Expression} that is true if this operand is between the two provided bounds.
   */
  between(lower: Operand, upper: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `${this.substitute({ attributeNames, attributeValues })} BETWEEN ${lower.substitute({ attributeNames, attributeValues })} AND ${upper.substitute({ attributeNames, attributeValues })}`;
      },
    });
  }

  // NOTE: both sides of this expression can either be attribute names or attribute values.
  contains(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `contains(${this.substitute({ attributeNames, attributeValues })}, ${rhs.substitute({ attributeNames, attributeValues })})`;
      },
    });
  }

  /**
   * Tests that two operands are equals.
   *
   * This uses the `=` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns The corresponding {@link Expression}.
   */
  equals(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `${this.substitute({ attributeNames, attributeValues })} = ${rhs.substitute({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * An alias for {@link equals}.
   */
  eq = this.equals.bind(this);

  /**
   * Tests that this operand is greater than the right operand.
   *
   * This uses the `>` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns The corresponding {@link Expression}.
   */
  greaterThan(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `${this.substitute({ attributeNames, attributeValues })} > ${rhs.substitute({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * Tests that this operand is greater than or equals to the right operand.
   *
   * This uses the `>=` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns The corresponding {@link Expression}.
   */
  greaterThanOrEquals(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `${this.substitute({ attributeNames, attributeValues })} >= ${rhs.substitute({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * An alias for {@link greaterThan}.
   */
  gt = this.greaterThan.bind(this);

  /**
   * An alias for {@link greaterThanOrEquals}
   */
  gte = this.greaterThanOrEquals.bind(this);

  /**
   * Tests that this operand is contained within the provided list.
   *
   * This uses the `IN` operator.
   *
   * @param operands - The list of operands to check against. This function throws if the list is
   * empty or contains more than 100 operands.
   *
   * @returns The corresponding {@link Expression} that is true if this operand is contained within the provided list.
   */
  in(...operands: Operand[]): Expression {
    if (operands.length === 0) {
      throw new Error("the IN operator requires at least one operand.");
    }
    if (operands.length > 100) {
      throw new Error(
        `up to 100 operands are support for the IN operator, got ${operands.length}`,
      );
    }

    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        const operandsString = operands
          .map((operand) =>
            operand.substitute({ attributeNames, attributeValues }),
          )
          .join(",");
        return `${this.substitute({ attributeNames, attributeValues })} IN (${operandsString})`;
      },
    });
  }

  /**
   * Tests that this operand is lower than the right operand.
   *
   * This uses the `<` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns The corresponding {@link Expression}.
   */
  lowerThan(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `${this.substitute({ attributeNames, attributeValues })} < ${rhs.substitute({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * Tests that this operand is lower than or equals to the right operand.
   *
   * This uses the `<=` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns The corresponding {@link Expression}.
   */
  lowerThanOrEquals(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `${this.substitute({ attributeNames, attributeValues })} <= ${rhs.substitute({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * An alias for {@link lowerThan}.
   */
  lt = this.lowerThan.bind(this);

  /**
   * An alias for {@link lowerThanOrEquals}
   */
  lte = this.lowerThanOrEquals.bind(this);

  /**
   * Tests that two operands are not equals.
   *
   * This is the opposite of {@link equals} and it uses the `<>` operator.
   *
   * @param rhs - The right hand side operand.
   *
   * @returns The corresponding {@link Expression}.
   */
  notEquals(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `${this.substitute({ attributeNames, attributeValues })} <> ${rhs.substitute({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * An alias for {@link notEquals}.
   */
  ne = this.notEquals.bind(this);

  // TODO: make a function? size(attribute("toto")) is more readable than attribute("toto").size()
  size(): Operand {
    return new SizeOperand(this);
  }

  abstract substitute(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string;
}

export class ExpressionAttribute extends Operand {
  private readonly path: AttributePath;

  constructor(path: AttributePath) {
    super();
    this.path = path;
  }

  /**
   * @returns An {@link Expression} that returns true if the provided attribute path exists.
   */
  // NOTE: the left hand side of this expression can only be a literal value (tested)
  exists(): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `attribute_exists(${this.substitute({ attributeNames, attributeValues })})`;
      },
    });
  }

  /**
   * @param type - The type to check against.
   * @returns An {@link Expression} that returns true if there exists an attribute at
   * the provided path of the given type.
   */
  // NOTE: the left hand side of this expression *can be* an attribute value pointing to a valid path.
  // NOTE: the right hand side of this expression *must be* an expression attribute (not a literal).
  isType(type: ExpressionValue<AttributeType>): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `attribute_type(${this.substitute({ attributeNames, attributeValues })}, ${type.substitute({ attributeNames, attributeValues })})`;
      },
    });
  }

  // NOTE: the left hand side of this expression can only be a literal value (tested)
  notExists(): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `attribute_not_exists(${this.substitute({ attributeNames, attributeValues })})`;
      },
    });
  }

  substitute(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    const { attributeNames } = params;
    return attributeNames.substitute(this.path);
  }
}

export function attribute(path: AttributePath): ExpressionAttribute {
  return new ExpressionAttribute(path);
}

export class ExpressionValue<T extends AttributeValue> extends Operand {
  private readonly value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  substitute(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    const { attributeValues } = params;
    return attributeValues.reference(this.value).toString();
  }
}

export function value<T extends AttributeValue = AttributeValue>(
  value: AttributeValue,
): ExpressionValue<T> {
  return new ExpressionValue(value);
}

class SizeOperand extends Operand {
  private readonly inner: Operand;

  constructor(operand: Operand) {
    super();
    this.inner = operand;
  }

  substitute(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    return `size(${this.inner.substitute(params)})`;
  }
}
