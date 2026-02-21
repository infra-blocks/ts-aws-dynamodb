import type { UpdateCommandInput as NativeUpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import type { WithRequired } from "@infra-blocks/types";
import type { KeyAttributes } from "../../types.js";
import { AttributeNames, AttributeValues } from "../attributes/index.js";
import { conditionExpression } from "../expressions/condition/expression.js";
import {
  type ConditionParams,
  UpdateExpression,
  type UpdateExpressionParams,
} from "../expressions/index.js";
import type { ConditionCheckFailureReturnValue } from "./lib.js";

export type UpdateItemReturnValue =
  | "NONE"
  | "ALL_OLD"
  | "UPDATED_OLD"
  | "ALL_NEW"
  | "UPDATED_NEW";

export interface UpdateItemInput<K extends KeyAttributes = KeyAttributes> {
  table: string;
  key: K;
  update: UpdateExpressionParams;
  condition?: ConditionParams;
  returnValues?: UpdateItemReturnValue;
  // Item stored unmarshalled in the thrown exception.
  returnValuesOnConditionCheckFailure?: ConditionCheckFailureReturnValue;
}

export const UpdateItemInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: UpdateItemInput<K>,
): UpdateCommandInput {
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  const result: UpdateCommandInput = {
    TableName: input.table,
    Key: input.key,
    UpdateExpression: UpdateExpression.from(input.update).stringify({
      names,
      values,
    }),
  };

  if (input.returnValues != null) {
    result.ReturnValues = input.returnValues;
  }

  if (input.returnValuesOnConditionCheckFailure != null) {
    result.ReturnValuesOnConditionCheckFailure =
      input.returnValuesOnConditionCheckFailure;
  }

  // If there is no condition, we know that the names and values are finalized and
  // we are ready to return the payload.
  if (input.condition == null) {
    result.ExpressionAttributeNames = names.getSubstitutions();
    result.ExpressionAttributeValues = values.getSubstitutions();
    return result;
  }

  // Otherwise, we need to stringify the condition, reusing the same names and values
  // as before.
  result.ConditionExpression = conditionExpression(input.condition).stringify({
    names,
    values,
  });
  result.ExpressionAttributeNames = names.getSubstitutions();
  result.ExpressionAttributeValues = values.getSubstitutions();
  return result;
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
