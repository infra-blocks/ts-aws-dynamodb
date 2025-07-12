import type { AttributePath, AttributeType } from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";
import type { Expression } from "./expression.js";

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

export function attributeNotExists(
  attribute: AttributePath,
): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames }) => {
        attributeNames.add(attribute);
        return `attribute_not_exists(${attributeNames.getSubstitute(attribute)})`;
      },
    },
  });
}

export function attributeExists(attribute: AttributePath): ConditionExpression {
  return new ConditionExpression({
    inner: {
      stringify: ({ attributeNames }) => {
        attributeNames.add(attribute);
        return `attribute_exists(${attributeNames.getSubstitute(attribute)})`;
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
        attributeNames.add(attribute);
        attributeValues.add(type);
        return `attribute_type(${attributeNames.getSubstitute(attribute)}, ${attributeValues.getReference(type)})`;
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
        attributeNames.add(attribute);
        attributeValues.add(value);
        return `begins_with(${attributeNames.getSubstitute(attribute)}, ${attributeValues.getReference(value)})`;
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
