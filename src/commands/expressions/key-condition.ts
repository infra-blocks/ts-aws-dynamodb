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
        attributeNames.add(name);
        attributeValues.add(value);
        const substitute = attributeNames.getSubstitute(name);
        const reference = attributeValues.getReference(value);
        return `${substitute} = ${reference}`;
      },
    },
  });
}
