import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { AttributeOperand } from "../operands/name.js";
import type { Operand } from "../operands/type.js";
import type { IUpdateAction, UpdateAction } from "./action.js";
import type { UpdateExpressionClauses } from "./clauses.js";
import type { IfNotExistsOperand } from "./if-not-exists.js";

export type SetOperand = Operand | IfNotExistsOperand;

export type SetOperator = "+" | "-";

type SetActionParams = SetToParams | SetToExpressionParams;

type SetToParams = {
  path: AttributeOperand;
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

// TODO: increment/decrement utilities built on top of the assignments.
export function set(path: AttributeOperand, operand: SetOperand): UpdateAction;
export function set(
  path: AttributeOperand,
  operand: SetOperand,
  operator: SetOperator,
  secondOperand: SetOperand,
): UpdateAction;
export function set(
  path: AttributeOperand,
  operand: SetOperand,
  operator?: SetOperator,
  secondOperand?: SetOperand,
): UpdateAction {
  return SetAction.from({
    path,
    operand,
    operator,
    secondOperand,
  });
}
