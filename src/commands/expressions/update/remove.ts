import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeOperand } from "../operands/name.js";
import type { IUpdateAction, UpdateAction } from "./action.js";
import type { UpdateExpressionClauses } from "./clauses.js";

export class RemoveAction implements IUpdateAction {
  private readonly path: AttributeOperand;

  private constructor(path: AttributeOperand) {
    this.path = path;
  }

  register(clauses: UpdateExpressionClauses): void {
    clauses.pushRemoveAction(this);
  }

  stringify(params: { names: AttributeNames }): string {
    const { names } = params;
    return this.path.substitute({ names });
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
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.DELETE
 */
export function remove(path: AttributeOperand): UpdateAction {
  return RemoveAction.from(path);
}
