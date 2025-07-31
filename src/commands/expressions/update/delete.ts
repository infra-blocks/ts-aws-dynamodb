import type { NativeSet } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { Path } from "../operands/path.js";
import type { Value } from "../operands/value.js";
import type { IUpdateAction, UpdateAction } from "./action.js";
import type { UpdateExpressionClauses } from "./clauses.js";

export class DeleteAction implements IUpdateAction {
  private readonly path: Path;
  private readonly value: Value<NativeSet>;

  private constructor(params: {
    path: Path;
    value: Value<NativeSet>;
  }) {
    const { path, value } = params;
    this.path = path;
    this.value = value;
  }

  register(clauses: UpdateExpressionClauses): void {
    clauses.pushDeleteAction(this);
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `${this.path.substitute({ names })} ${this.value.substitute({
      values,
    })}`;
  }

  static from(params: { path: Path; value: Value<NativeSet> }): DeleteAction {
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

export function deleteFrom(path: Path, value: Value<NativeSet>): UpdateAction {
  return DeleteAction.from({ path, value });
}
