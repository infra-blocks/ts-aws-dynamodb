import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter } from "../formatter.js";
import { Path, type PathInput } from "../operands/path.js";

export type AttributeNotExists = ExpressionFormatter &
  Brand<"AttributeNotExists">;

/**
 * Returns a condition that uses the `attribute_not_exists` function.
 *
 * @param input - The attribute path to check for non-existence.
 * @returns An {@link AttributeNotExists} that evaluates to true if the provided attribute path does not exist.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeNotExists(input: PathInput): AttributeNotExists {
  const path = Path.normalize(input);
  return trusted(
    ExpressionFormatter.from(
      ({ names }) => `attribute_not_exists(${path.format({ names })})`,
    ),
  );
}
