import type { AttributeNames, AttributeValues } from "../attributes/index.js";

export type Formatter = (params: {
  names: AttributeNames;
  values: AttributeValues;
}) => string;

export type ExpressionFormatter = {
  format(params: { names: AttributeNames; values: AttributeValues }): string;
};

export const ExpressionFormatter = {
  from(formatter: Formatter): ExpressionFormatter {
    return {
      format: formatter,
    };
  },
};
