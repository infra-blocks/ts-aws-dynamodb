import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../expression.js";
import { Path, type RawPath } from "../operands/path.js";

export type AttributeNotExists = ExpressionFormatter &
  Brand<"AttributeNotExists">;

/**
 * Returns a condition that uses the `attribute_not_exists` function.
 *
 * @param rawPath - The attribute path to check for non-existence.
 * @returns An {@link AttributeNotExists} that evaluates to true if the provided attribute path does not exist.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeNotExists(rawPath: RawPath): AttributeNotExists {
  const path = Path.normalize(rawPath);
  return trusted(
    ExpressionFormatter.from(
      ({ names }) => `attribute_not_exists(${path.substitute({ names })})`,
    ),
  );
}
