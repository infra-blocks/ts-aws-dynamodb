import { AttributeNames } from "../attributes/names.js";
import { AttributeValues } from "../attributes/values.js";
import type { ExpressionFormatter } from "../expressions/formatter.js";

export type ConditionCheckFailureReturnValue = "NONE" | "ALL_OLD";

export const CONDITION_CHECK_FAILURE_RETURN_VALUES: ReadonlyArray<ConditionCheckFailureReturnValue> =
  ["NONE", "ALL_OLD"];

/**
 * A type regrouping all possible values for `returnConsumedCapacity` options.
 */
export type ConsumedCapacityReturnValue = "NONE" | "INDEXES" | "TOTAL";

export const CONSUMED_CAPACITY_RETURN_VALUES: ReadonlyArray<ConsumedCapacityReturnValue> =
  ["NONE", "INDEXES", "TOTAL"];

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

/**
 * A type regrouping all possible values for `returnItemCollectionMetrics` options.
 */
export type ItemCollectionMetricsReturnValue = "NONE" | "SIZE";

export const ITEM_COLLECTION_METRICS_RETURN_VALUES: ReadonlyArray<ItemCollectionMetricsReturnValue> =
  ["NONE", "SIZE"];
