import type {
  AttributeValueNumber,
  AttributeValueSet,
} from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import type { AttributeOperand } from "../operands/name.js";
import type { ValueOperand } from "../operands/value.js";
import type { IUpdateAction } from "./expression.js";

type NumberOrSet = AttributeValueNumber | AttributeValueSet;

// Note: the first operand *must* be an attribute name, and the second operand *must* be a value.
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
    return `${this.path.substitute({ names })} ${this.value.substitute({ values })}`;
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
 * What adding means depends on the types of the operands:p
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
