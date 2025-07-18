/*
Notes: an update is made of a series of actions. Each action belongs to a clause and each clause
can be present at least once in an update. The clauses are:
- SET,
- REMOVE,
- ADD,
- DELETE

SET actions can use the `if_not_exists` function, which returns the value of the attribute if it exists, or a default value if it does not.
You can also use SET to add or subtract from an attribute that is of type Number. To perform multiple SET actions, separate them with commas.
*/
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";
import type { IExpression } from "./expression.js";
import type { AttributeOperand, IOperand, Operand } from "./operands.js";

/*
The syntax would look something like this:
set([attribute(<name>).to(value("35"), attribute(<name>).to(attribute(<name>).plus(value("5")))]) => returns an UpdateExpression with a SetClause populated.
because attributes are already defined for the expressions, adding methods to them willy nilly for update expressions might not be the best idea?
Alternative: update({
    set: [assign(attribute(<name>).to(value("35"))), increment(attribute(<name>).by(value(5))), decrement(attribute(<name>).by(ifNotExists(attribute(<x>), value(0))))]
})

Values here can be attributes, values or the if_not_exists function. It should there be a union type at this point. this might need some refactoring to make
sense.
*/

export type UpdateExpressionParams = ReadonlyArray<UpdateAction>;

interface UpdateExpressionClauses {
  set?: SetAction[];
}

export class UpdateExpression implements IExpression {
  private readonly clauses: UpdateExpressionClauses;

  private constructor(clauses: UpdateExpressionClauses) {
    this.clauses = clauses;
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    const parts: string[] = [];
    if (this.clauses.set != null) {
      parts.push(
        `SET ${this.clauses.set
          .map((action) => action.stringify({ names, values }))
          .join(",")}`,
      );
    }
    return parts.join("\n");
  }

  static from(params: UpdateExpressionParams): UpdateExpression {
    const clauses: UpdateExpressionClauses = {};
    for (const action of params) {
      if (
        action instanceof Assignment ||
        action instanceof PlusAssignment ||
        action instanceof MinusAssignment
      ) {
        if (clauses.set != null) {
          clauses.set.push(action);
        } else {
          clauses.set = [action];
        }
      } else {
        throw new Error("unknown action type in update expression");
      }
    }
    return new UpdateExpression(clauses);
  }
}

export interface IUpdateAction {
  stringify(params: { names: AttributeNames; values: AttributeValues }): string;
}

export type UpdateAction = SetAction;

export type SetAction = Assignment | PlusAssignment | MinusAssignment;

export type SetOperand = Operand | IfNotExistsOperand;

// Note: incrementation works with attribute names and values no prob.
// There can only be one "+" sign.
// Nothing forces the operation to happen on the same attribute. For example: SET x = y + 2 is valid and should
// be supported. Increment should only be a fast track there.
class Assignment implements IUpdateAction {
  private readonly path: AttributeOperand;
  private readonly operand: SetOperand;

  constructor(params: { path: AttributeOperand; operand: SetOperand }) {
    const { path, operand } = params;
    this.path = path;
    this.operand = operand;
  }

  plus(operand: SetOperand): PlusAssignment {
    return new PlusAssignment({ inner: this, operand });
  }

  minus(operand: SetOperand): MinusAssignment {
    return new MinusAssignment({ inner: this, operand });
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `${this.path.substitute({ names, values })} = ${this.operand.substitute(
      {
        names,
        values,
      },
    )}`;
  }
}

export class PlusAssignment implements IUpdateAction {
  private readonly inner: Assignment;
  private readonly operand: SetOperand;

  constructor(params: {
    inner: Assignment;
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

export class MinusAssignment implements IUpdateAction {
  private readonly inner: Assignment;
  private readonly operand: SetOperand;

  constructor(params: {
    inner: Assignment;
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

class AssignmentBuilder {
  private readonly path: AttributeOperand;

  constructor(path: AttributeOperand) {
    this.path = path;
  }

  to(operand: SetOperand): Assignment {
    return new Assignment({ path: this.path, operand });
  }
}

// TODO: increment/decrement utilities built on top of the assignments.
export function assign(path: AttributeOperand): AssignmentBuilder {
  return new AssignmentBuilder(path);
}

export class IfNotExistsOperand implements IOperand {
  private readonly path: AttributeOperand;
  private readonly defaultValue: Operand;

  constructor(params: { path: AttributeOperand; defaultValue: Operand }) {
    const { path, defaultValue } = params;
    this.path = path;
    this.defaultValue = defaultValue;
  }

  substitute(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `if_not_exists(${this.path.substitute({ names, values })}, ${this.defaultValue.substitute({ names, values })})`;
  }
}

export function ifNotExists(
  path: AttributeOperand,
  defaultValue: Operand,
): IfNotExistsOperand {
  return new IfNotExistsOperand({ path, defaultValue });
}
