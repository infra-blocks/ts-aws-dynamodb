import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { ExpressionFormatter } from "../expression.js";
import type { UpdateAction } from "./action.js";
import { UpdateExpressionClauses } from "./clauses.js";

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

export type UpdateParams = ReadonlyArray<UpdateAction>;

/**
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
 */

export class Update implements ExpressionFormatter {
  private readonly clauses: UpdateExpressionClauses;

  private constructor(clauses: UpdateExpressionClauses) {
    this.clauses = clauses;
  }

  format(params: { names: AttributeNames; values: AttributeValues }): string {
    const { names, values } = params;
    const parts: string[] = [];
    this.pushAddActions({ parts, names, values });
    this.pushDeleteActions({ parts, names, values });
    this.pushRemoveActions({ parts, names });
    this.pushSetActions({ parts, names, values });
    return parts.join("\n");
  }

  private pushAddActions(params: {
    parts: Array<string>;
    names: AttributeNames;
    values: AttributeValues;
  }): void {
    const { parts, names, values } = params;
    const actions = this.clauses.getAddActions();
    if (actions == null || actions.length === 0) {
      return;
    }
    parts.push(
      `ADD ${actions
        .map((action) => action.stringify({ names, values }))
        .join(",")}`,
    );
  }

  private pushDeleteActions(params: {
    parts: Array<string>;
    names: AttributeNames;
    values: AttributeValues;
  }): void {
    const { parts, names, values } = params;
    const actions = this.clauses.getDeleteActions();
    if (actions == null || actions.length === 0) {
      return;
    }
    parts.push(
      `DELETE ${actions
        .map((action) => action.stringify({ names, values }))
        .join(",")}`,
    );
  }

  private pushRemoveActions(params: {
    parts: Array<string>;
    names: AttributeNames;
  }): void {
    const { parts, names } = params;
    const actions = this.clauses.getRemoveActions();
    if (actions == null || actions.length === 0) {
      return;
    }
    parts.push(
      `REMOVE ${actions
        .map((action) => action.stringify({ names }))
        .join(",")}`,
    );
  }

  private pushSetActions(params: {
    parts: Array<string>;
    names: AttributeNames;
    values: AttributeValues;
  }): void {
    const { parts, names, values } = params;
    const actions = this.clauses.getSetActions();
    if (actions == null || actions.length === 0) {
      return;
    }
    parts.push(
      `SET ${actions
        .map((action) => action.stringify({ names, values }))
        .join(",")}`,
    );
  }

  static from(params: UpdateParams): Update {
    const clauses: UpdateExpressionClauses =
      UpdateExpressionClauses.from(params);
    return new Update(clauses);
  }
}
