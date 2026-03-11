import type { PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../types.js";
import { Condition, type ConditionInput } from "../expressions/index.js";
import { ifDefined, unsetUndefined } from "../lib.js";
import type {
  ConditionCheckFailureReturnValue,
  ConsumedCapacityReturnValue,
  ItemCollectionMetricsReturnValue,
} from "./lib.js";
import { ExpressionsFormatter } from "./lib.js";

export type PutItemConsumedCapacityReturnValue = ConsumedCapacityReturnValue;

export type PutItemItemCollectionMetricsReturnValue =
  ItemCollectionMetricsReturnValue;

export type PutItemReturnValue = ConditionCheckFailureReturnValue;

export type PutItemInput<T extends Attributes = Attributes> = {
  /**
   * The table where the item will be stored located.
   */
  table: string;
  /**
   * The item in question.
   */
  item: T;
  /**
   * A condition expression for the operation, if any.
   */
  condition?: ConditionInput;
  /**
   * The requested consumed capacity metrics on return, if any. Defaults to "NONE".
   */
  returnConsumedCapacity?: PutItemConsumedCapacityReturnValue;
  /**
   * The requested item collection metrics on return, if any. Defaults to "NONE".
   */
  returnItemCollectionMetrics?: PutItemItemCollectionMetricsReturnValue;
  /**
   * The requested return values, if any. Defaults to "NONE".
   */
  returnValues?: PutItemReturnValue;
  /**
   * Whether to store the item in a {@link ConditionalCheckFailureException} when one
   * is thrown. Defaults to "NONE".
   */
  returnValuesOnConditionCheckFailure?: ConditionCheckFailureReturnValue;
};

export const PutItemInput = {
  encode,
};

function encode<T extends Attributes = Attributes>(
  input: PutItemInput<T>,
): PutCommandInput {
  const formatter = ExpressionsFormatter.create();
  return unsetUndefined({
    TableName: input.table,
    Item: input.item,
    ConditionExpression: ifDefined(input.condition, (v) =>
      formatter.format(Condition.from(v)),
    ),
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
    ExpressionAttributeValues: formatter.getExpressionAttributeValues(),
    ReturnConsumedCapacity: input.returnConsumedCapacity,
    ReturnItemCollectionMetrics: input.returnItemCollectionMetrics,
    ReturnValues: input.returnValues,
    ReturnValuesOnConditionCheckFailure:
      input.returnValuesOnConditionCheckFailure,
  });
}
