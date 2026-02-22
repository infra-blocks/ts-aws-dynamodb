import type { PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../types.js";
import { Condition, type ConditionParams } from "../expressions/index.js";
import type { ConditionCheckFailureReturnValue } from "./lib.js";
import { ExpressionsFormatter } from "./lib.js";

export type PutItemReturnValue = ConditionCheckFailureReturnValue;

export type PutItemInput<T extends Attributes = Attributes> = {
  table: string;
  item: T;
  condition?: ConditionParams;
  returnValues?: PutItemReturnValue;
  // The item will be stored in the thrown exception and won't be unarmashalled.
  // See: https://github.com/aws/aws-sdk-js-v3/issues/6723
  returnValuesOnConditionCheckFailure?: ConditionCheckFailureReturnValue;
};

export type PutItemResult<T extends Attributes> = { item?: T };

export const PutItemInput = {
  encode,
};

function encode<T extends Attributes = Attributes>(
  input: PutItemInput<T>,
): PutCommandInput {
  const result: PutCommandInput = {
    TableName: input.table,
    Item: input.item,
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
