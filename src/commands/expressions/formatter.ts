import { isFunction, isObjectNotNull } from "@infra-blocks/types";
import type { AttributeNames, AttributeValues } from "../attributes/index.js";

export type Formatter = (params: {
  names: AttributeNames;
  values: AttributeValues;
}) => string;

export type ExpressionFormatter = {
  format(params: { names: AttributeNames; values: AttributeValues }): string;
};

export type PathFormatter = {
  format(params: { names: AttributeNames }): string;
};

export type ValueFormatter = {
  format(params: { values: AttributeValues }): string;
};

export const ExpressionFormatter = {
  from(formatter: Formatter): ExpressionFormatter {
    return {
      format: formatter,
    };
  },
};

export function isExpressionFormatter(
  value: unknown,
): value is ExpressionFormatter {
  return (
    isObjectNotNull(value) && "format" in value && isFunction(value.format)
  );
}
