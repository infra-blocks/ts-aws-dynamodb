import type { AttributePath } from "../../types.js";

/**
 * A substitution always starts with the `#` character.
 */
export type Substitution = `#${string}`;

/**
 * Represents a set of attribute names used in a condition expression.
 *
 * The uses cases for using attribute names are:
 * - To access an attribute whose name conflicts with a DynamoDB reserved word.
 * - To create a placeholder for repeating occurrences of an attribute name in an expression.
 * - To prevent special characters in an attribute name from being misinterpreted in an expression.
 */
export class AttributeNames {
  private readonly names: Map<AttributePath, Substitution>;

  private constructor() {
    this.names = new Map<AttributePath, Substitution>();
  }

  add(...attributes: AttributePath[]) {
    for (const attribute of attributes) {
      if (this.names.has(attribute)) {
        continue;
      }
      const substitute = this.generateSubstitute(attribute);
      this.names.set(attribute, substitute);
    }
  }

  getSubstitute(attribute: AttributePath): Substitution {
    const substitute = this.names.get(attribute);
    if (substitute == null) {
      throw new Error(`no substitution found for attribute: ${attribute}`);
    }
    return substitute;
  }

  getSubstitutions(): Record<Substitution, AttributePath> | undefined {
    if (this.names.size === 0) {
      return undefined;
    }

    const result: Record<Substitution, AttributePath> = {};
    for (const [attribute, substitute] of this.names.entries()) {
      result[substitute] = attribute;
    }
    return result;
  }

  private generateSubstitute(attribute: AttributePath): Substitution {
    return `#${attribute}` as Substitution;
  }

  static create(): AttributeNames {
    return new AttributeNames();
  }
}
