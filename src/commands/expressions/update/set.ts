import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { AttributeOperand } from "../operands/name.js";
import type { Operand } from "../operands/type.js";
import type { IUpdateAction } from "./expression.js";
import type { IfNotExistsOperand } from "./if-not-exists.js";

export type SetAction = SetTo | SetToPlus | SetToMinus;

export type SetOperand = Operand | IfNotExistsOperand;
export class SetTo implements IUpdateAction {
  private readonly path: AttributeOperand;
  private readonly operand: SetOperand;

  constructor(params: { path: AttributeOperand; operand: SetOperand }) {
    const { path, operand } = params;
    this.path = path;
    this.operand = operand;
  }

  plus(operand: SetOperand): SetToPlus {
    return new SetToPlus({ inner: this, operand });
  }

  minus(operand: SetOperand): SetToMinus {
    return new SetToMinus({ inner: this, operand });
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `${this.path.substitute({ names })} = ${this.operand.substitute({
      names,
      values,
    })}`;
  }
}

export class SetToPlus implements IUpdateAction {
  private readonly inner: SetTo;
  private readonly operand: SetOperand;

  constructor(params: {
    inner: SetTo;
    operand: SetOperand;
  }) {
    const { inner, operand } = params;
    this.inner = inner;
    this.operand = operand;
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `${this.inner.stringify({ names, values })} + ${this.operand.substitute(
      {
        names,
        values,
      },
    )}`;
  }
}

export class SetToMinus implements IUpdateAction {
  private readonly inner: SetTo;
  private readonly operand: SetOperand;

  constructor(params: {
    inner: SetTo;
    operand: SetOperand;
  }) {
    const { inner, operand } = params;
    this.inner = inner;
    this.operand = operand;
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `${this.inner.stringify({ names, values })} - ${this.operand.substitute(
      {
        names,
        values,
      },
    )}`;
  }
}

class SetToBuilder {
  private readonly path: AttributeOperand;

  constructor(path: AttributeOperand) {
    this.path = path;
  }

  to(operand: SetOperand): SetTo {
    return new SetTo({ path: this.path, operand });
  }
}

// TODO: increment/decrement utilities built on top of the assignments.
// TODO: review API for something more streamlined.... Imagine something like:
// set(attribute(<name>), value(<value>)) or set(attribute(<name>), value(<first>), "+", value(<second>))
export function set(path: AttributeOperand): SetToBuilder {
  return new SetToBuilder(path);
}
