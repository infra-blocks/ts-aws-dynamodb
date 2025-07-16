import type { AttributePath, AttributeValue } from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";

// TODO: unit test these bitches.
export type Operand<T extends AttributeValue = AttributeValue> =
  | AttributeOperand
  | ValueOperand<T>;

export interface IOperand {
  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string;
}

export class ValueOperand<T extends AttributeValue> implements IOperand {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { values } = params;
    return values.reference(this.value).toString();
  }
}

export function value<T extends AttributeValue = AttributeValue>(
  value: AttributeValue,
): ValueOperand<T> {
  return new ValueOperand(value);
}

export class AttributeOperand implements IOperand {
  private readonly path: AttributePath;

  constructor(path: AttributePath) {
    this.path = path;
  }

  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names } = params;
    return names.substitute(this.path);
  }
}

export function attribute(path: AttributePath): AttributeOperand {
  return new AttributeOperand(path);
}
