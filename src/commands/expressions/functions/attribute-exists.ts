import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../formatter.js";
import { Path, type PathInput } from "../operands/path.js";

export type AttributeExists = ExpressionFormatter & Brand<"AttributeExists">;

/**
 * Returns a condition that uses the `attribute_exists` function.
 *
 * @param input - The attribute path to check for existence.
 * @returns An {@link AttributeExists} that evaluates to true if the provided attribute path exists.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeExists(input: PathInput): AttributeExists {
  const path = Path.normalize(input);
  return trusted(
    ExpressionFormatter.from(
      ({ names }) => `attribute_exists(${path.format({ names })})`,
    ),
  );
}
