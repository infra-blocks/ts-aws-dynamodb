import type { AttributeValue } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IOperand, Operand } from "../operands/operand.js";
import { Path, type RawPath } from "../operands/path.js";

export class IfNotExists<T extends AttributeValue = AttributeValue>
  implements IOperand
{
  private readonly path: Path;
  private readonly defaultValue: Operand<T>;

  constructor(params: { path: Path; defaultValue: Operand<T> }) {
    const { path, defaultValue } = params;
    this.path = path;
    this.defaultValue = defaultValue;
  }

  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `if_not_exists(${this.path.substitute({ names })}, ${this.defaultValue.substitute({ names, values })})`;
  }
}

export function ifNotExists<T extends AttributeValue = AttributeValue>(
  rawPath: RawPath,
  defaultValue: Operand<T>,
): IfNotExists<T> {
  const path = Path.normalize(rawPath);
  return new IfNotExists({ path, defaultValue });
}
