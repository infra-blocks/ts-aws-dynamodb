import { checkNotNull } from "@infra-blocks/checks";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import type { ExpressionFormatter } from "../../../../src/commands/expressions/expression.js";
import type { IOperand } from "../../../../src/commands/expressions/operands/operand.js";

export function expressionMatch(params: {
  expression: ExpressionFormatter;
  matcher: RegExp;
}) {
  const { expression, matcher } = params;
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  const match = checkNotNull(
    matcher.exec(expression.format({ names, values })),
  );
  return {
    names: names,
    values: values,
    match,
  };
} // TODO: elsewhere

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
