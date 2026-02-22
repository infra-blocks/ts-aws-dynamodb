import type { DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../types.js";
import { Condition, type ConditionParams } from "../expressions/index.js";
import type { ConditionCheckFailureReturnValue } from "./lib.js";
import { ExpressionsFormatter } from "./lib.js";

export type DeleteItemReturnValue = ConditionCheckFailureReturnValue;

export type DeleteItemInput<K extends KeyAttributes = KeyAttributes> = {
  table: string;
  key: K;
  condition?: ConditionParams;
  returnValues?: DeleteItemReturnValue;
  // Item stored unmarshalled in the thrown exception.
  returnValuesOnConditionCheckFailure?: ConditionCheckFailureReturnValue;
};

export const DeleteItemInput = {
  encode,
};

function encode<K extends KeyAttributes>(
  input: DeleteItemInput<K>,
): DeleteCommandInput {
  const result: DeleteCommandInput = {
    TableName: input.table,
    Key: input.key,
  };

  if (input.returnValues != null) {
    result.ReturnValues = input.returnValues;
  }

  if (input.returnValuesOnConditionCheckFailure != null) {
    result.ReturnValuesOnConditionCheckFailure =
      input.returnValuesOnConditionCheckFailure;
  }

  // Expression attribute names and values can only be specified when a condition is provided,
  // which is optional.
  if (input.condition == null) {
    return result;
  }

  const formatter = ExpressionsFormatter.create();
  return {
    ...result,
    ConditionExpression: formatter.format(Condition.from(input.condition)),
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
    ExpressionAttributeValues: formatter.getExpressionAttributeValues(),
  };
}
