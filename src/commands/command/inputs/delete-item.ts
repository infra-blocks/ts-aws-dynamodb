import type { DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../../types.js";
import type { ConditionParams } from "../../expressions/index.js";
import { intoExpressionComponents } from "./lib.js";

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
