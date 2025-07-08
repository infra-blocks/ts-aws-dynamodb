import type {
  AttributePath,
  AttributeType,
  AttributeValue,
} from "../../types.js";

type AttributeSubstitution = `#${string}`;

/**
 * Represents a set of attribute names used in a condition expression.
 *
 * The uses cases for using attribute names are:
 * - To access an attribute whose name conflicts with a DynamoDB reserved word.
 * - To create a placeholder for repeating occurrences of an attribute name in an expression.
 * - To prevent special characters in an attribute name from being misinterpreted in an expression.
 */
class AttributeSubstitutions {
  private readonly names: Map<AttributePath, AttributeSubstitution>;

  constructor() {
    this.names = new Map<AttributePath, AttributeSubstitution>();
  }

  substitute(attribute: AttributePath): AttributeSubstitution {
    const existing = this.names.get(attribute);
    if (existing != null) {
      return existing;
    }
    const substitute = this.generateSubstitute(attribute);
    this.names.set(attribute, substitute);
    return substitute;
  }

  toAwsInput(): Record<AttributeSubstitution, AttributePath> {
    const result: Record<AttributeSubstitution, AttributePath> = {};
    for (const [attribute, substitute] of this.names.entries()) {
      result[substitute] = attribute;
    }
    return result;
  }

  private generateSubstitute(attribute: AttributePath): AttributeSubstitution {
    return `#${attribute}` as AttributeSubstitution;
  }
}

type ValueReference = `:${string}`;

class AttributeValues {
  private readonly values: Map<AttributeValue, ValueReference>;
  private counter: number;

  constructor() {
    this.values = new Map<AttributeValue, ValueReference>();
    this.counter = 0;
  }

  referenceBy(value: AttributeValue): ValueReference {
    const existing = this.values.get(value);
    if (existing != null) {
      return existing;
    }
    const reference = this.generateReference();
    this.values.set(value, reference);
    return reference;
  }

  toAwsInput(): Record<ValueReference, AttributeValue> {
    const result: Record<ValueReference, AttributeValue> = {};
    for (const [value, reference] of this.values.entries()) {
      result[reference] = value;
    }
    return result;
  }

  private generateReference(): ValueReference {
    const reference = `:${this.counter}` as ValueReference;
    this.counter += 1;
    return reference;
  }
}

export type ExpressionAwsInput = {
  ConditionExpression: string;
  ExpressionAttributeNames?: Record<AttributeSubstitution, AttributePath>;
  ExpressionAttributeValues?: Record<ValueReference, AttributeValue>;
};

export class ConditionExpression {
  private readonly expression: string;
  private readonly substitutions?: AttributeSubstitutions;
  private readonly values?: AttributeValues;

  private constructor(params: {
    expression: string;
    substitutions?: AttributeSubstitutions;
    values?: AttributeValues;
  }) {
    const { expression, substitutions, values } = params;
    this.expression = expression;
    this.substitutions = substitutions;
    this.values = values;
  }

  toAwsInput(): ExpressionAwsInput {
    const result: ExpressionAwsInput = {
      ConditionExpression: this.expression,
    };
    if (this.substitutions != null) {
      result.ExpressionAttributeNames = this.substitutions.toAwsInput();
    }
    if (this.values != null) {
      result.ExpressionAttributeValues = this.values.toAwsInput();
    }
    return result;
  }

  static attributeNotExists(attribute: AttributePath): ConditionExpression {
    const substitutions = new AttributeSubstitutions();
    const sub = substitutions.substitute(attribute);
    return new ConditionExpression({
      expression: `attribute_not_exists(${sub})`,
      substitutions,
    });
  }

  static attributeExists(attribute: AttributePath): ConditionExpression {
    const substitutions = new AttributeSubstitutions();
    const sub = substitutions.substitute(attribute);
    return new ConditionExpression({
      expression: `attribute_exists(${sub})`,
      substitutions,
    });
  }

  static attributeType(
    attribute: AttributePath,
    type: AttributeType,
  ): ConditionExpression {
    const substitutions = new AttributeSubstitutions();
    const sub = substitutions.substitute(attribute);
    const values = new AttributeValues();
    const valueRef = values.referenceBy(type);
    return new ConditionExpression({
      expression: `attribute_type(${sub}, ${valueRef})`,
      substitutions,
      values,
    });
  }
}
