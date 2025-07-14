import type {
  AttributePath,
  AttributeType,
  AttributeValue,
} from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";

// NOTES:
// A string literal in an expression is *always* a reference to an attribute path, and seems to be always valid syntax.
// For example, `beginws_with(toto, tata)` is valid and checks that the attribute value toto begins with the content of the attribute tata.
// Obviously, this particular case is not useful, but there could be edge cases where this type of function call is, so we should support it.
// We could always require the user to be explicit about it. For example, syntax like `beginsWith("toto", "tata")` could be rejected and the
// user could have to provide one of: `beginsWith("toto", attribute("tata"))` or `beginsWith("toto", value("tata"))`. The call
// can also entirely be made with attribute values, as such: `begins_with(:val1, :val2)`.

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

  and(rhs: Expression): Expression {
    return new Expression({
      stringify: ({ attributeNames, attributeValues }) => {
        const left = this.stringify({ attributeNames, attributeValues });
        const right = rhs.stringify({ attributeNames, attributeValues });
        return `(${left} AND ${right})`;
      },
    });
  }

  or(rhs: Expression): Expression {
    return new Expression({
      stringify: ({ attributeNames, attributeValues }) => {
        const left = this.stringify({ attributeNames, attributeValues });
        const right = rhs.stringify({ attributeNames, attributeValues });
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
        return `begins_with(${this.register({ attributeNames, attributeValues })}, ${rhs.register({ attributeNames, attributeValues })})`;
      },
    });
  }

  // NOTE: both sides of this expression can either be attribute names or attribute values.
  contains(rhs: Operand): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `contains(${this.register({ attributeNames, attributeValues })}, ${rhs.register({ attributeNames, attributeValues })})`;
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
        return `${this.register({ attributeNames, attributeValues })} = ${rhs.register({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * An alias for {@link equals}.
   */
  eq = this.equals.bind(this);

  /**
   * Tests that the left operand is greater than the right operand.
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
        return `${this.register({ attributeNames, attributeValues })} > ${rhs.register({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * Tests that the left operand is greater than or equals to the right operand.
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
        return `${this.register({ attributeNames, attributeValues })} >= ${rhs.register({ attributeNames, attributeValues })}`;
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
   * Tests that the left operand is lower than the right operand.
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
        return `${this.register({ attributeNames, attributeValues })} < ${rhs.register({ attributeNames, attributeValues })}`;
      },
    });
  }

  /**
   * Tests that the left operand is lower than or equals to the right operand.
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
        return `${this.register({ attributeNames, attributeValues })} <= ${rhs.register({ attributeNames, attributeValues })}`;
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
        return `${this.register({ attributeNames, attributeValues })} <> ${rhs.register({ attributeNames, attributeValues })}`;
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

  abstract register(params: {
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

  // NOTE: the left hand side of this expression can only be a literal value (tested)
  exists(): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `attribute_exists(${this.register({ attributeNames, attributeValues })})`;
      },
    });
  }

  // NOTE: the left hand side of this expression can only be a literal value (tested)
  notExists(): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `attribute_not_exists(${this.register({ attributeNames, attributeValues })})`;
      },
    });
  }

  // NOTE: the left hand side of this expression *can be* an attribute value pointing to a valid path.
  // NOTE: the right hand side of this expression *must be* an expression attribute (not a literal).
  type(type: AttributeType): Expression {
    return expression({
      stringify: ({ attributeNames, attributeValues }) => {
        return `attribute_type(${this.register({ attributeNames, attributeValues })}, ${attributeValues.reference(type)})`;
      },
    });
  }

  register(params: {
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

export class ExpressionValue extends Operand {
  private readonly value: AttributeValue;

  constructor(value: AttributeValue) {
    super();
    this.value = value;
  }

  register(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    const { attributeValues } = params;
    return attributeValues.reference(this.value).toString();
  }
}

export function value(value: AttributeValue): ExpressionValue {
  return new ExpressionValue(value);
}

class SizeOperand extends Operand {
  private readonly inner: Operand;

  constructor(operand: Operand) {
    super();
    this.inner = operand;
  }

  register(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    return `size(${this.inner.register(params)})`;
  }
}
