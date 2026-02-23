import { type Brand, trusted } from "@infra-blocks/types";
import type { AttributeType } from "../../../types.js";
import { ExpressionFormatter } from "../formatter.js";
import { Path, type PathInput } from "../operands/path.js";
import { Value, type ValueInput } from "../operands/value.js";

// Not named "AttributeType" as it would conflict with the existing type.
export type IsAttributeOfType = ExpressionFormatter &
  Brand<"IsAttributeOfType">;

/**
 * Returns a condition that uses the `attribute_type` function.
 *
 * @param attribute - The attribute path to check.
 * @param input - The expected type of the attribute.
 *
 * @returns An {@link IsAttributeOfType} that evaluates to true if the attribute is of the expected type.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeType(
  attribute: PathInput,
  input: ValueInput<AttributeType>,
): IsAttributeOfType {
  const path = Path.normalize(attribute);
  const type = Value.normalize(input);
  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `attribute_type(${path.format({ names })}, ${type.format({ values })})`,
    ),
  );
}
