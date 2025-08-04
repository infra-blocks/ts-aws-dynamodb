import type { NativeNumber, NativeSet } from "../../../types.js";
import type { AttributeNames } from "../../attributes/names.js";
import type { AttributeValues } from "../../attributes/values.js";
import { Path, type RawPath } from "../operands/path.js";
import type { Value } from "../operands/value.js";
import type { IUpdateAction, UpdateAction } from "./action.js";
import type { UpdateExpressionClauses } from "./clauses.js";

type NumberOrSet = NativeNumber | NativeSet;

export class AddAction implements IUpdateAction {
  private readonly path: Path;
  private readonly value: Value<NumberOrSet>;

  private constructor(params: {
    path: Path;
    value: Value<NumberOrSet>;
  }) {
    const { path, value } = params;
    this.path = path;
    this.value = value;
  }

  register(clauses: UpdateExpressionClauses): void {
    clauses.pushAddAction(this);
  }

  stringify(params: {
    names: AttributeNames;
    values: AttributeValues;
  }): string {
    const { names, values } = params;
    return `${this.path.substitute({ names })} ${this.value.substitute({ values })}`;
  }

  static from(params: { path: Path; value: Value<NumberOrSet> }): AddAction {
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
 * @param rawPath - The attribute path to modify.
 * @param value - The value to add to the attribute.
 *
 * @returns An {@link AddAction} that will add the value to the attribute at the specified path.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.ADD
 */

export function add(rawPath: RawPath, value: Value<NumberOrSet>): UpdateAction {
  const path = Path.normalize(rawPath);
  return AddAction.from({ path, value });
}
