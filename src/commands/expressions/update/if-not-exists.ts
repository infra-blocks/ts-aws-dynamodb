import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { PathOperand } from "../operands/name.js";
import type { IOperand, Operand } from "../operands/type.js";

export class IfNotExistsOperand implements IOperand {
  private readonly path: PathOperand;
  private readonly defaultValue: Operand;

  constructor(params: { path: PathOperand; defaultValue: Operand }) {
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
  path: PathOperand,
  defaultValue: Operand,
): IfNotExistsOperand {
  return new IfNotExistsOperand({ path, defaultValue });
}
