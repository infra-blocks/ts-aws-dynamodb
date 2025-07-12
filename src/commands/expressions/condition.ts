import type {
  AttributePath,
  AttributeType,
  AttributeValue,
} from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";
import type { Expression } from "./expression.js";

export class FunctionExpression implements Expression {
  private readonly inner: Expression;
  constructor(params: { inner: Expression }) {
    const { inner } = params;
    this.inner = inner;
  }

  stringify(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    return this.inner.stringify(params);
  }
}

/**
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
 */
export class ConditionExpression implements Expression {
  private readonly inner: Expression;

  constructor(params: { inner: Expression }) {
    const { inner } = params;
    this.inner = inner;
  }

  stringify(params: {
    attributeNames: AttributeNames;
    attributeValues: AttributeValues;
  }): string {
    return this.inner.stringify(params);
  }

  or(other: ConditionExpression): ConditionExpression {
    return new ConditionExpression({
      inner: {
        stringify: ({ attributeNames, attributeValues }) => {
          const left = this.stringify({ attributeNames, attributeValues });
          const right = other.stringify({ attributeNames, attributeValues });
          return `(${left} OR ${right})`;
        },
      },
    });
  }

  and(other: ConditionExpression): ConditionExpression {
    return new ConditionExpression({
      inner: {
        stringify: ({ attributeNames, attributeValues }) => {
          const left = this.stringify({ attributeNames, attributeValues });
          const right = other.stringify({ attributeNames, attributeValues });
          return `(${left} AND ${right})`;
        },
      },
    });
  }
}

/**
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeNotExists(
  attribute: AttributePath,
): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames }) => {
        return `attribute_not_exists(${attributeNames.substitute(attribute)})`;
      },
    },
  });
}

export function attributeExists(attribute: AttributePath): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames }) => {
        return `attribute_exists(${attributeNames.substitute(attribute)})`;
      },
    },
  });
}

export function attributeType(
  attribute: AttributePath,
  type: AttributeType,
): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames, attributeValues }) => {
        return `attribute_type(${attributeNames.substitute(attribute)}, ${attributeValues.reference(type)})`;
      },
    },
  });
}

export function beginsWith(
  attribute: AttributePath,
  value: string,
): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames, attributeValues }) => {
        return `begins_with(${attributeNames.substitute(attribute)}, ${attributeValues.reference(value)})`;
      },
    },
  });
}

export function contains(
  attribute: AttributePath,
  value: AttributeValue | FunctionExpression,
): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames, attributeValues }) => {
        if (value instanceof FunctionExpression) {
          return `contains(${attributeNames.substitute(attribute)}, ${value.stringify({ attributeNames, attributeValues })})`;
        }
        return `contains(${attributeNames.substitute(attribute)}, ${attributeValues.reference(value)})`;
      },
    },
  });
}

// This is the only factory that doesn't return a ConditionExpression. This is because the size function
// does not return a boolean value, rather a number of items. This also means that it can be used in more
// complex expressions, such as in a comparison: Toto > size(Tata).
export function size(attribute: AttributePath): FunctionExpression {
  return new FunctionExpression({
    inner: {
      stringify: ({ attributeNames }) => {
        return `size(${attributeNames.substitute(attribute)})`;
      },
    },
  });
}

export function not(condition: ConditionExpression): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames, attributeValues }) => {
        const inner = condition.stringify({ attributeNames, attributeValues });
        return `NOT (${inner})`;
      },
    },
  });
}
