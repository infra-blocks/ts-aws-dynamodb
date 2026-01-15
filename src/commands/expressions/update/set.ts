import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { Operand } from "../operands/operand.js";
import { Path, type RawPath } from "../operands/path.js";
import type { IUpdateAction, UpdateAction } from "./action.js";
import type { UpdateExpressionClauses } from "./clauses.js";
import type { IfNotExists } from "./if-not-exists.js";

export type SetOperand = Operand | IfNotExists;

export type SetOperator = "+" | "-";

type SetActionParams = SetToParams | SetToExpressionParams;

type SetToParams = {
  path: Path;
  operand: SetOperand;
};

type SetToExpressionParams = SetToParams & {
  operator: SetOperator;
  secondOperand: SetOperand;
};

export class SetAction implements IUpdateAction {
  private readonly params: SetActionParams;

  private constructor(params: SetActionParams) {
    this.params = params;
  }

  register(clauses: UpdateExpressionClauses): void {
    clauses.pushSetAction(this);
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    let result = `${this.params.path.substitute({ names })} = ${this.params.operand.substitute(
      {
        names,
        values,
      },
    )}`;
    if ("operator" in this.params && this.params.operator != null) {
      result += ` ${this.params.operator} ${this.params.secondOperand.substitute(
        {
          names,
          values,
        },
      )}`;
    }
    return result;
  }

  static from(params: SetActionParams): SetAction {
    return new SetAction(params);
  }
}

// TODO: support rawoperand here?
// TODO: increment/decrement utilities built on top of the assignments.
export function set(rawPath: RawPath, operand: SetOperand): UpdateAction;
export function set(
  rawPath: RawPath,
  operand: SetOperand,
  operator: SetOperator,
  secondOperand: SetOperand,
): UpdateAction;
export function set(
  rawPath: RawPath,
  operand: SetOperand,
  operator?: SetOperator,
  secondOperand?: SetOperand,
): UpdateAction {
  return SetAction.from({
    path: Path.normalize(rawPath),
    operand,
    operator,
    secondOperand,
  });
}
