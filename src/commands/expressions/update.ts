import type { AttributeValueNumber, AttributeValueSet } from "../../types.js";
import type { AttributeNames } from "../attributes/names.js";
import type { AttributeValues } from "../attributes/values.js";
import type { IExpression } from "./expression.js";
import type { AttributeOperand } from "./operands/name.js";
import type { IOperand, Operand } from "./operands/type.js";
import type { ValueOperand } from "./operands/value.js";

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
  delete?: DeleteAction[];
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
    if (this.clauses.delete != null) {
      parts.push(
        `DELETE ${this.clauses.delete
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
        action instanceof SetTo ||
        action instanceof SetToPlus ||
        action instanceof SetToMinus
      ) {
        clauses.set ??= [];
        clauses.set.push(action);
      } else if (action instanceof RemoveAction) {
        clauses.remove ??= [];
        clauses.remove.push(action);
      } else if (action instanceof DeleteAction) {
        clauses.delete ??= [];
        clauses.delete.push(action);
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

export type UpdateAction = AddAction | DeleteAction | RemoveAction | SetAction;

export type SetAction = SetTo | SetToPlus | SetToMinus;

export type SetOperand = Operand | IfNotExistsOperand;

class SetTo implements IUpdateAction {
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
    return `${this.path.substitute({ names, values })} = ${this.operand.substitute(
      {
        names,
        values,
      },
    )}`;
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
 * @param path - The path of the attribute to remove. * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.DELETE

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

/**
 * Returns an action that will add the provided value to the attribute at the specified path.
 *
 * What adding means depends on the type of the attribute:
 * - If both the attribute and the value are numbers, then an increment operation is performed.
 * - If both the attribute and the value are sets, then a concatenation is performed.
 *
 * This action only supports numbers and sets as values.
 *
 * @param path - The attribute path to modify.
 * @param value - The value to add to the attribute.
 *
 * @returns An {@link AddAction} that will add the value to the attribute at the specified path.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.ADD
 */
export function add(
  path: AttributeOperand,
  value: ValueOperand<NumberOrSet>,
): AddAction {
  return AddAction.from({ path, value });
}

export class DeleteAction implements IUpdateAction {
  private readonly path: AttributeOperand;
  private readonly value: ValueOperand<AttributeValueSet>;

  private constructor(params: {
    path: AttributeOperand;
    value: ValueOperand<AttributeValueSet>;
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
    return `${this.path.substitute({ names, values })} ${this.value.substitute({
      names,
      values,
    })}`;
  }

  static from(params: {
    path: AttributeOperand;
    value: ValueOperand<AttributeValueSet>;
  }): DeleteAction {
    return new DeleteAction(params);
  }
}

/**
 * Returns an action that will delete the provided subset from the attribute at the specified path.
 *
 * This operation only supports sets as values. The resulting set will be the original set minus the
 * provided subset.
 *
 * @param path - The attribute path to modify.
 * @param value - The value to remove from the attribute.
 *
 * @returns A {@link DeleteAction} that will remove the subset from the attribute.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.DELETE
 */
export function deleteFrom(
  path: AttributeOperand,
  value: ValueOperand<AttributeValueSet>,
): DeleteAction {
  return DeleteAction.from({ path, value });
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
