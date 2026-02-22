import { type Brand, trusted } from "@infra-blocks/types";
import type { AttributeType } from "../../../types.js";
import { ExpressionFormatter } from "../expression.js";
import { Path, type RawPath } from "../operands/path.js";
import { type RawValue, Value } from "../operands/value.js";

// Not named "AttributeType" as it would conflict with the existing type.
export type IsAttributeOfType = ExpressionFormatter &
  Brand<"IsAttributeOfType">;

/**
 * Returns a condition that uses the `attribute_type` function.
 *
 * @param attribute - The attribute path to check.
 * @param rawType - The expected type of the attribute.
 *
 * @returns An {@link IsAttributeOfType} that evaluates to true if the attribute is of the expected type.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Functions
 */
export function attributeType(
  attribute: RawPath,
  rawType: RawValue<AttributeType>,
): IsAttributeOfType {
  const path = Path.normalize(attribute);
  const type = Value.normalize(rawType);
  return trusted(
    ExpressionFormatter.from(
      ({ names, values }) =>
        `attribute_type(${path.substitute({ names })}, ${type.substitute({ values })})`,
    ),
  );
}
