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
import type { AttributeValueNumber, AttributeValueSet } from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";
import type { IExpression } from "./expression.js";
import type { AttributeOperand } from "./operands/name.js";
import type { IOperand, Operand } from "./operands/type.js";
import type { ValueOperand } from "./operands/value.js";

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
  remove?: RemoveAction[];
  add?: AddAction[];
}

/**
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
 */
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
    if (this.clauses.remove != null) {
      parts.push(
        `REMOVE ${this.clauses.remove
          .map((action) => action.stringify({ names, values }))
          .join(",")}`,
      );
    }
    if (this.clauses.add != null) {
      parts.push(
        `ADD ${this.clauses.add
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
        clauses.set ??= [];
        clauses.set.push(action);
      } else if (action instanceof RemoveAction) {
        clauses.remove ??= [];
        clauses.remove.push(action);
      } else if (action instanceof AddAction) {
        clauses.add ??= [];
        clauses.add.push(action);
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

export type UpdateAction = SetAction | RemoveAction | AddAction;

export type SetAction = Assignment | PlusAssignment | MinusAssignment;

export type SetOperand = Operand | IfNotExistsOperand;

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

export class RemoveAction implements IUpdateAction {
  private readonly path: AttributeOperand;

  private constructor(path: AttributeOperand) {
    this.path = path;
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return this.path.substitute({ names, values });
  }

  static from(path: AttributeOperand): RemoveAction {
    return new RemoveAction(path);
  }
}

/**
 * Returns an action that will remove the specific attribute at the provided path.
 *
 * @param path - The path of the attribute to remove.
 *
 * @returns A {@link RemoveAction} corresponding to the path provided.
 */
export function remove(path: AttributeOperand): RemoveAction {
  return RemoveAction.from(path);
}

type NumberOrSet = AttributeValueNumber | AttributeValueSet;

// Note: the first operand *must* be an attribute name, and the second operand *must* be a value.
// This action only makes sense for sets and numbers.
export class AddAction implements IUpdateAction {
  private readonly path: AttributeOperand;
  private readonly value: ValueOperand<NumberOrSet>;

  private constructor(params: {
    path: AttributeOperand;
    value: ValueOperand<NumberOrSet>;
  }) {
    const { path, value } = params;
    this.path = path;
    this.value = value;
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `${this.path.substitute({ names, values })} ${this.value.substitute({ names, values })}`;
  }

  static from(params: {
    path: AttributeOperand;
    value: ValueOperand<NumberOrSet>;
  }): AddAction {
    return new AddAction(params);
  }
}

export function add(
  path: AttributeOperand,
  value: ValueOperand<NumberOrSet>,
): AddAction {
  return AddAction.from({ path, value });
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
