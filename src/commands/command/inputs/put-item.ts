import type { PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../../index.js";
import { AttributeNames, AttributeValues } from "../../attributes/index.js";
import { conditionExpression } from "../../expressions/condition/expression.js";
import type { ConditionParams } from "../../index.js";

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

  const names = AttributeNames.create();
  const values = AttributeValues.create();
  // Ask the expression to stringify itself, applying the substitutions by itself.
  const expression = conditionExpression(input.condition).stringify({
    names,
    values,
  });

  return {
    ...result,
    ConditionExpression: expression,
    ExpressionAttributeNames: names.getSubstitutions(),
    ExpressionAttributeValues: values.getSubstitutions(),
  };
}
