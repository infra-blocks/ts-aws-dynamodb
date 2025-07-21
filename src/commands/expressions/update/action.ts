import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { AddAction } from "./add.js";
import type { UpdateExpressionClauses } from "./clauses.js";
import type { DeleteAction } from "./delete.js";
import type { RemoveAction } from "./remove.js";
import type { SetAction } from "./set.js";

export interface IUpdateAction {
  /**
   * Registers the action within the {@link UpdateExpressionClauses}.
   *
   * @param clauses - The clauses to register the action in.
   */
  register(clauses: UpdateExpressionClauses): void;

  /**
   * Stringifies the action within the clause.
   *
   * For example, if the action is a `SetAction`, it will be invoked as such:
   * `SET ${action.stringify({names, values})}`. So the clause identifier is managed
   * by the caller.
   *
   * @param params.names - The attribute names to substitute in the action.
   * @param params.values - The attribute values to substitute in the action.
   */
  stringify(params: { names: AttributeNames; values: AttributeValues }): string;
}

/**
 * This type aggregates all the possible update actions that can be performed.
 */
export type UpdateAction = AddAction | DeleteAction | RemoveAction | SetAction;
