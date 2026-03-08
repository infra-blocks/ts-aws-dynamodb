import type { UpdateCommandInput as NativeUpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import type { WithRequired } from "@infra-blocks/types";
import type { KeyAttributes } from "../../types.js";
import {
  Condition,
  type ConditionInput,
  Update,
  type UpdateInput,
} from "../expressions/index.js";
import { ifDefined, unsetUndefined } from "../lib.js";
import type {
  ConditionCheckFailureReturnValue,
  ConsumedCapacityReturnValue,
} from "./lib.js";
import { ExpressionsFormatter } from "./lib.js";

export type UpdateItemConsumedCapacityReturnValue = ConsumedCapacityReturnValue;

export type UpdateItemReturnValue =
  | "NONE"
  | "ALL_OLD"
  | "UPDATED_OLD"
  | "ALL_NEW"
  | "UPDATED_NEW";

export const UPDATE_ITEM_RETURN_VALUES: ReadonlyArray<UpdateItemReturnValue> = [
  "NONE",
  "ALL_OLD",
  "UPDATED_OLD",
  "ALL_NEW",
  "UPDATED_NEW",
];

export interface UpdateItemInput<K extends KeyAttributes = KeyAttributes> {
  /**
   * The table name of the updated item.
   */
  table: string;
  /**
   * The primary key values of the item to update.
   *
   * This should always include at least the partition key, and the sort key if one
   * is part of the table's primary key. No more than 2 fields are expected here.
   */
  key: K;
  /**
   * The update expression of the operation.
   */
  update: UpdateInput;
  /**
   * A condition expression for the operation, if any.
   */
  condition?: ConditionInput;
  /**
   * The requested consumed capacity metrics on return. Defaults to "NONE".
   */
  returnConsumedCapacity?: UpdateItemConsumedCapacityReturnValue;
  /**
   * The requested return values. Defaults to "NONE".
   */
  returnValues?: UpdateItemReturnValue;
  /**
   * The values to store the item in a {@link ConditionalCheckFailureException} when one
   * is thrown. Defaults to "NONE".
   */
  returnValuesOnConditionCheckFailure?: ConditionCheckFailureReturnValue;
}

export const UpdateItemInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: UpdateItemInput<K>,
): UpdateCommandInput {
  const formatter = ExpressionsFormatter.create();
  return unsetUndefined({
    TableName: input.table,
    Key: input.key,
    UpdateExpression: formatter.format(Update.from(input.update)),
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

/*
The native command input type has the UpdateExpression field as optional,
since there are many legacy alternatives. In our implementation, we are
guaranteed to produce an object with the UpateExpression set, as we don't
support legacy parameters. Typing it as such is useful, as the equivalent
action within a transaction *requires* the UpdateExpression to be set.
So, this means, we can use the output of `toAwsCommandInput` directly
into a transaction action expression.
*/
type UpdateCommandInput = WithRequired<
  NativeUpdateCommandInput,
  "UpdateExpression"
>;
