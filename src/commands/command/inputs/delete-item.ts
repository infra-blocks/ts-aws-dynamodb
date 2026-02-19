import type { DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../../types.js";
import { AttributeNames } from "../../attributes/names.js";
import { AttributeValues } from "../../attributes/values.js";
import { conditionExpression } from "../../expressions/condition/expression.js";
import type { ConditionParams } from "../../expressions/index.js";

export type DeleteItemReturnValue = "ALL_OLD" | "NONE";

export type DeleteItemInput<K extends KeyAttributes = KeyAttributes> = {
  table: string;
  key: K;
  condition?: ConditionParams;
  returnValues?: DeleteItemReturnValue;
  // The item will be stored in the thrown exception and won't be unarmashalled.
  // See: https://github.com/aws/aws-sdk-js-v3/issues/6723
  returnValuesOnConditionCheckFailure?: DeleteItemReturnValue;
};

export function encode<K extends KeyAttributes>(
  input: DeleteItemInput<K>,
): DeleteCommandInput {
  const transformed: DeleteCommandInput = {
    TableName: input.table,
    Key: input.key,
  };

  if (input.returnValues != null) {
    transformed.ReturnValues = input.returnValues;
  }

  if (input.returnValuesOnConditionCheckFailure != null) {
    transformed.ReturnValuesOnConditionCheckFailure =
      input.returnValuesOnConditionCheckFailure;
  }

  // Expression attribute names and values can only be specified when a condition is provided,
  // which is optional.
  if (input.condition == null) {
    return transformed;
  }

  // TODO: this in a reusable function.
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  // Ask the expression to stringify itself, applying the substitutions by itself.
  const expression = conditionExpression(input.condition).stringify({
    names,
    values,
  });

  return {
    ...transformed,
    ConditionExpression: expression,
    ExpressionAttributeNames: names.getSubstitutions(),
    ExpressionAttributeValues: values.getSubstitutions(),
  };
}
