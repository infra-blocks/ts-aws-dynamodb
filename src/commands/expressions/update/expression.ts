import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { IExpression } from "../expression.js";
import { AddAction } from "./add.js";
import { DeleteAction } from "./delete.js";
import { RemoveAction } from "./remove.js";
import { type SetAction, SetTo, SetToMinus, SetToPlus } from "./set.js";

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
          .map((action) => action.stringify({ names }))
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
