import type { AttributeValue } from "../../types.js";

export type ValueReference = `:${string}`;

export class AttributeValues {
  private readonly values: Map<AttributeValue, ValueReference>;
  private counter: number;

  private constructor() {
    this.values = new Map<AttributeValue, ValueReference>();
    this.counter = 0;
  }

  add(...values: AttributeValue[]): void {
    for (const value of values) {
      if (this.values.has(value)) {
        continue;
      }
      const reference = this.nextReference();
      this.values.set(value, reference);
    }
  }

  getReference(value: AttributeValue): ValueReference {
    const existing = this.values.get(value);
    if (existing != null) {
      return existing;
    }
    const reference = this.nextReference();
    this.values.set(value, reference);
    return reference;
  }

  getReferences(): Record<ValueReference, AttributeValue> | undefined {
    if (this.values.size === 0) {
      return undefined;
    }

    const result: Record<ValueReference, AttributeValue> = {};
    for (const [value, reference] of this.values.entries()) {
      result[reference] = value;
    }
    return result;
  }

  private nextReference(): ValueReference {
    const reference = `:${this.counter}` as ValueReference;
    this.counter += 1;
    return reference;
  }

  static create(): AttributeValues {
    return new AttributeValues();
  }
}
