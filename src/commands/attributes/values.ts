import type { AttributeValue } from "../../types.js";

export type ValueReference = `:${string}`;

/**
 * Represents a set of attribute values used in an expression.
 *
 * This class provides an automated way to generate value reference variables
 * so that every value in an expression can be treated the same: systematically replaced
 * with an automatically generated variable.
 *
 * The class keeps track of the references generated for each value, such that when
 * the user requests a reference for a known value, that reference is returned.
 *
 * When the user requests a reference for an unknown value, then one is generated and
 * stored for future use.
 */
export class AttributeValues {
  private readonly values: Map<AttributeValue, ValueReference>;
  private counter: number;

  private constructor() {
    this.values = new Map<AttributeValue, ValueReference>();
    this.counter = 0;
  }

  /**
   * Returns a reference variable for the given attribute value.
   *
   * If the attribute value is seen for the first time by this object, a new reference is generated,
   * assigned to the attribute value, and returned.
   *
   * If the value was previously seen, then the associated reference is returned.
   *
   * @param value - The attribute value to generate a reference for.
   *
   * @returns The reference associated with the attribute value.
   */
  //TODO: rename to substitute so it's the same errrrrwhere.
  reference(value: AttributeValue): ValueReference {
    const existing = this.values.get(value);
    if (existing != null) {
      // If the value is already known, we do not need to generate a new reference.
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
