import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../expression.js";
import { Path, type RawPath } from "../operands/path.js";

export type AttributeExists = ExpressionFormatter & Brand<"AttributeExists">;

/**
 * Returns a condition that uses the `attribute_exists` function.
 *
 * @param rawPath - The attribute path to check for existence.
 * @returns An {@link AttributeExists} that evaluates to true if the provided attribute path exists.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeExists(rawPath: RawPath): AttributeExists {
  const path = Path.normalize(rawPath);
  return trusted(
    ExpressionFormatter.from(
      ({ names }) => `attribute_exists(${path.substitute({ names })})`,
    ),
  );
}
