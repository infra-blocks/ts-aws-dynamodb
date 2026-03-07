import type { DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../types.js";
import { Condition, type ConditionInput } from "../expressions/index.js";
import { ifDefined, unsetUndefined } from "../lib.js";
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
   * A condition expression for the operation.
   */
  condition?: ConditionInput;
  /**
   * The requested consumed capacity metrics on return, if any.
   */
  returnConsumedCapacity?: DeleteItemConsumedCapacityReturnValue;
  /**
   * The requested return value, if any.
   */
  returnValues?: DeleteItemReturnValue;
  /**
   * Whether to store the item in a {@link ConditionalCheckFailureException} when one
   * is thrown.
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
