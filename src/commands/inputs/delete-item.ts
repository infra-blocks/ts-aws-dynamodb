import type { DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import type { KeyAttributes } from "../../types.js";
import { Condition, type ConditionInput } from "../expressions/index.js";
import { unsetUndefined } from "../lib.js";
import type {
  ConditionCheckFailureReturnValue,
  ConsumedCapacityReturnValue,
} from "./lib.js";
import { ExpressionsFormatter } from "./lib.js";

export type DeleteItemConsumedCapacityReturnValue = ConsumedCapacityReturnValue;

export type DeleteItemReturnValue = ConditionCheckFailureReturnValue;

export type DeleteItemInput<K extends KeyAttributes = KeyAttributes> = {
  /**
   * The table where the item is located.
   */
  table: string;
  /**
   * The item's primary key values.
   *
   * Expected either a single partition key value or a composite of partition
   * key and sort key.
   */
  key: K;
  /**
   * A condition expression for the operation, if any.
   */
  condition?: ConditionInput;
  /**
   * The requested consumed capacity metrics on return, if any.
   */
  returnConsumedCapacity?: DeleteItemConsumedCapacityReturnValue;
  /**
   * The requested return values, if any. Defaults to "NONE".
   */
  returnValues?: DeleteItemReturnValue;
  /**
   * Whether to store the item in a {@link ConditionalCheckFailureException} when one
   * is thrown. Defaults to "NONE".
   */
  returnValuesOnConditionCheckFailure?: ConditionCheckFailureReturnValue;
};

export const DeleteItemInput = {
  encode,
};

function encode<K extends KeyAttributes>(
  input: DeleteItemInput<K>,
): DeleteCommandInput {
  const formatter = ExpressionsFormatter.create();
  return unsetUndefined({
    TableName: input.table,
    Key: input.key,
    ConditionExpression: ifDefined(input.condition, (v) =>
      formatter.format(Condition.from(v)),
    ),
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
    ExpressionAttributeValues: formatter.getExpressionAttributeValues(),
    ReturnConsumedCapacity: input.returnConsumedCapacity,
    ReturnValues: input.returnValues,
    ReturnValuesOnConditionCheckFailure:
      input.returnValuesOnConditionCheckFailure,
  });
}
