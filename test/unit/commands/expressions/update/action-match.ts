import { checkNotNull } from "@infra-blocks/checks";
import { AttributeNames } from "../../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../../src/commands/attributes/values.js";
import type { IExpression } from "../../../../../src/commands/expressions/expression.js";
import type { IOperand } from "../../../../../src/commands/expressions/operands/operand.js";
import type { UpdateAction } from "../../../../../src/index.js";

export function actionMatch(params: {
  action: UpdateAction;
  matcher: RegExp;
}): {
  names: AttributeNames;
  values: AttributeValues;
  match: RegExpExecArray;
} {
  const { action, matcher } = params;
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  const match = checkNotNull(matcher.exec(action.stringify({ names, values })));
  return {
    names: names,
    values: values,
    match,
  };
}

// TODO: elsewhere
export function operandMatch(params: { operand: IOperand; matcher: RegExp }) {
  const { operand, matcher } = params;
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  const match = checkNotNull(
    matcher.exec(operand.substitute({ names, values })),
  );
  return {
    names: names,
    values: values,
    match,
  };
}

export function expressionMatch(params: {
  expression: IExpression;
  matcher: RegExp;
}) {
  const { expression, matcher } = params;
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  const match = checkNotNull(
    matcher.exec(expression.stringify({ names, values })),
  );
  return {
    names: names,
    values: values,
    match,
  };
}
