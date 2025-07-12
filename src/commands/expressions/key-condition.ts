import type { AttributePath, AttributeValue } from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";
import type { Expression } from "./expression.js";

export class KeyConditionExpression implements Expression {
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

export function equals(
  name: AttributePath,
  value: AttributeValue,
): KeyConditionExpression {
  return new KeyConditionExpression({
    inner: {
      stringify: ({ attributeNames, attributeValues }) => {
        const substitute = attributeNames.substitute(name);
        const reference = attributeValues.reference(value);
        return `${substitute} = ${reference}`;
      },
    },
  });
}
