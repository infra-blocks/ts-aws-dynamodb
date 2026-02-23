import { type Brand, trusted } from "@infra-blocks/types";
import type { AttributeValue } from "../../../types.js";
import { ExpressionFormatter } from "../formatter.js";
import { Path, type PathInput } from "../operands/path.js";
import type { PathOrValue } from "../operands/path-or-value.js";

export type IfNotExists<T extends AttributeValue = AttributeValue> =
  ExpressionFormatter & Brand<"IfNotExists"> & { _phantom?: T };

export const IfNotExists = {
  from<T extends AttributeValue = AttributeValue>(
    path: Path,
    defaultValue: PathOrValue<T>,
  ): IfNotExists<T> {
    return trusted({
      ...ExpressionFormatter.from(
        ({ names, values }) =>
          `if_not_exists(${path.format({ names })}, ${defaultValue.format({ names, values })})`,
      ),
    });
  },
};

// TODO: support PathOrValueInput here?
export function ifNotExists<T extends AttributeValue = AttributeValue>(
  path: PathInput,
  defaultValue: PathOrValue<T>,
): IfNotExists<T> {
  return IfNotExists.from(Path.normalize(path), defaultValue);
}
