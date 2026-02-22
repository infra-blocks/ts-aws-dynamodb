import { AttributeNames } from "../attributes/names.js";
import { AttributeValues } from "../attributes/values.js";
import type { ExpressionFormatter } from "../expressions/expression.js";

export type ConditionCheckFailureReturnValue = "NONE" | "ALL_OLD";

export type ExpressionsFormatter = {
  format(formatter: ExpressionFormatter): string;
  getExpressionAttributeNames(): ReturnType<AttributeNames["getSubstitutions"]>;
  getExpressionAttributeValues(): ReturnType<
    AttributeValues["getSubstitutions"]
  >;
};

export const ExpressionsFormatter = {
  create(params?: {
    names?: AttributeNames;
    values?: AttributeValues;
  }): ExpressionsFormatter {
    const {
      names = AttributeNames.create(),
      values = AttributeValues.create(),
    } = params ?? {};

    return {
      format: (formatter) => formatter.format({ names, values }),
      getExpressionAttributeNames: () => names.getSubstitutions(),
      getExpressionAttributeValues: () => values.getSubstitutions(),
    };
  },
};
