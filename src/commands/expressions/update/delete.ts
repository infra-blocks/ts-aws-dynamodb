import type { AttributeValueSet } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { AttributeOperand } from "../operands/name.js";
import type { ValueOperand } from "../operands/value.js";
import type { IUpdateAction } from "./expression.js";

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
    return `${this.path.substitute({ names })} ${this.value.substitute({
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
