import type { Attributes } from "../../types.js";

export class KeyConditionExpression {
  private readonly expression: string;
  private readonly attributeValues: Attributes;

  private constructor(params: {
    expression: string;
    attributeValues: Attributes;
  }) {
    const { expression, attributeValues } = params;
    this.expression = expression;
    this.attributeValues = attributeValues;
  }

  toJson(): { expression: string; attributeValues: Attributes } {
    return {
      expression: this.expression,
      attributeValues: this.attributeValues,
    };
  }

  static partitionKeyEquals(params: {
    name: string;
    value: string;
    token?: string;
  }): KeyConditionExpression {
    const { name, value, token = ":pk" } = params;
    return KeyConditionExpression.equals({
      name,
      value,
      token,
    });
  }

  static equals(params: {
    name: string;
    value: string;
    token: string;
  }): KeyConditionExpression {
    const { name, value, token } = params;

    return new KeyConditionExpression({
      expression: `${name} = ${token}`,
      attributeValues: { [token]: value },
    });
  }
}
