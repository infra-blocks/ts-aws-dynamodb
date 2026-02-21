import type { AttributePath } from "../../types.js";

/**
 * A path substitution always starts with the `#` character.
 */
export type PathSubstitution = `#${string}`;

// TODO: handle the ambiguous case where an attribute name contains a `.` character (and isn't a path). This might require adding vocabulary to operands.
// For example, it might be fixed by adding a `literal()` operand.
/**
 * Represents a set of attribute names used in a condition expression.
 *
 * The uses cases for using attribute names are:
 * - To access an attribute whose name conflicts with a DynamoDB reserved word.
 * - To create a placeholder for repeating occurrences of an attribute name in an expression.
 * - To prevent special characters in an attribute name from being misinterpreted in an expression.
 *
 * This class provides an automated way to generate attribute substitution variables
 * so that every attribute path in an expression can be treated the same: systematically replaced
 * with an automatically generated variable.
 *
 * The class keeps track of the variables generated for each attribute path, such that when
 * the user requests a substitution for a known value, that substitution is returned.
 *
 * When the user requests a substitution for an unknown attribute name, then one is generated and
 * stored for future use.
 */
export class AttributeNames {
  private readonly names: Map<AttributePath, PathSubstitution>;

  private constructor() {
    this.names = new Map<AttributePath, PathSubstitution>();
  }

  // TODO: the edge case where the path would be something like literal("hello.toto").otherField is still
  // not covered.
  /**
   * Returns a substitution variable for the given attribute path.
   *
   * If the attribute path is seen for the first time by this object, a new substitution is generated,
   * it is assigned to the attribute path, and returned. If the attribute path was previously registered,
   * then the associated substitution is returned instead.
   *
   * The substitution is of the form "#attr<N>", where N is a counter starting at 1 and incremented
   * each time a *new* path is seen. So the first substitution returned by this object will inevitably
   * start with "#attr1".*
   *
   * The substitution's default algorithm goes like this:
   * - Throw if the provided input is empty.
   * - Split all path tokens sperated by dots ('.').
   * - For each of them:
   *   - Throw if they are an empty string.
   *   - They are indexed if a pair of square brackets can be found ('[]'). *No parsing is done
   *   within the brackets*. So, even though "toto[ta[t]a]" is an invalid attribute path for DynamoDB,
   *   this function will let it slide. The corresponding expression will be rejected by DynamoDB at runtime
   *   mfk. Why would you even? Anyway, if the prefix to the opening bracket is empty, throw again.
   *   - Generate a corresponding substitution and append in result
   * - Join result subsitutions with dots and return.
   *
   * If the attribute path is a nested item expression, such as "object.inner.stuff", then the
   * function will return "#attr1.#attr2.#attr3" and have registered 3 paths for future use:
   * "object", "inner", and "stuff".
   *
   * If the attribute path is an indexed item expression, such as "list[2]", then the function
   * will return "#attr1[2]" and have registered one path for future use: "list".
   *
   * Every other attribute path is simply replaced by "#attr<N>" and stored as is for future use.
   *
   * If a user wishes to bypass all the above logic and simply register the path as is, such as
   * could be the case if an attribute's name contains a dot, then the `literal` option can be set
   * to true.
   *
   * @param attribute - The path of the attribute to substitute.
   * @param options - The substitution option.
   *
   * @returns The substitution associated with the attribute path.
   */
  substitute(
    attribute: AttributePath,
    options?: { literal?: boolean },
  ): PathSubstitution {
    const { literal = false } = options || {};

    if (attribute.length === 0) {
      throw new Error(
        "error substituting attribute: empty attribute path not allowed",
      );
    }

    if (literal) {
      return this.getOrSetNextSubstituteFor(attribute);
    }

    const result = [];
    for (const token of attribute.split(".")) {
      if (token.length === 0) {
        throw new Error(
          `error substituting attribute ${attribute}: empty path token not allowed`,
        );
      }

      // If it's indexed.
      const match = INDEX_REGEX.exec(token);
      if (match != null) {
        const indexedToken = token.slice(0, match.index);
        if (indexedToken.length === 0) {
          throw new Error(
            `error substituting attribute ${attribute}: empty path token not allowed`,
          );
        }

        // #attrN substitution will map to the token before the index brackets.
        const pathSubstitute = this.getOrSetNextSubstituteFor(indexedToken);
        // The substitute will be of the form #attrN[<originalIndex>]
        result.push(`${pathSubstitute}${match[1]}`);
        continue;
      }

      const substitute = this.getOrSetNextSubstituteFor(token);
      result.push(substitute);
    }
    return result.join(".") as PathSubstitution;
  }

  /**
   * Returns a record where the keys are the substitutions generated by this object
   * and the values are the corresponding attribute paths they where generated for.
   *
   * @returns A mapping of substitutions generated by this object, undefined if none were.
   */
  getSubstitutions(): Record<PathSubstitution, AttributePath> | undefined {
    if (this.names.size === 0) {
      return undefined;
    }

    const result: Record<PathSubstitution, AttributePath> = {};
    for (const [attribute, substitute] of this.names.entries()) {
      result[substitute] = attribute;
    }
    return result;
  }

  private getOrSetNextSubstituteFor(path: AttributePath): PathSubstitution {
    const current = this.names.get(path);
    if (current != null) {
      return current;
    }
    const next = `#attr${this.names.size + 1}` as PathSubstitution;
    this.names.set(path, next);
    return next;
  }

  static create(): AttributeNames {
    return new AttributeNames();
  }
}

// REGEX used to find a pair of matching brackets within an attribute path token.
// The expression starting with the opening bracket all the way to the end of the token is capture in group 1.
const INDEX_REGEX = /(\[.*\].*)$/;
