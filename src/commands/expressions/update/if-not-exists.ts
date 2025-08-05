import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import { Path, type RawPath } from "../operands/path.js";
import type { IOperand, Operand } from "../operands/type.js";

// TODO: generic type on this bitch.
export class IfNotExistsOperand implements IOperand {
  private readonly path: Path;
  private readonly defaultValue: Operand;

  constructor(params: { path: Path; defaultValue: Operand }) {
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

export function ifNotExists(
  rawPath: RawPath,
  defaultValue: Operand,
): IfNotExistsOperand {
  const path = Path.normalize(rawPath);
  return new IfNotExistsOperand({ path, defaultValue });
}
