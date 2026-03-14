import type { ExpressionFormatter } from "../formatter.js";
import type { AddAction } from "./add.js";
import type { UpdateExpressionClauses } from "./clauses.js";
import type { DeleteAction } from "./delete.js";
import type { RemoveAction } from "./remove.js";
import type { SetAction } from "./set.js";

export type IUpdateAction = ExpressionFormatter & {
  /**
   * Registers the action within the {@link UpdateExpressionClauses}.
   *
   * @param clauses - The clauses to register the action in.
   */
  register(clauses: UpdateExpressionClauses): void;
};

/**
 * This type aggregates all the possible update actions that can be performed.
 */
export type UpdateAction = AddAction | DeleteAction | RemoveAction | SetAction;
