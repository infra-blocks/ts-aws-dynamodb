import type { PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../../index.js";
import type { ConditionParams } from "../../index.js";
import { intoExpressionComponents } from "./lib.js";

export type PutItemReturnValue = "ALL_OLD" | "NONE";

export type PutItemInput<T extends Attributes = Attributes> = {
  table: string;
  item: T;
  condition?: ConditionParams;
  returnValues?: PutItemReturnValue;
  // The item will be stored in the thrown exception and won't be unarmashalled.
  // See: https://github.com/aws/aws-sdk-js-v3/issues/6723
  returnValuesOnConditionCheckFailure?: PutItemReturnValue;
};

export type PutItemResult<T extends Attributes> = { item?: T };

export function encode<T extends Attributes = Attributes>(
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

  const { expression, names, values } = intoExpressionComponents(
    input.condition,
  );

  return {
    ...result,
    ConditionExpression: expression,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  };
}
