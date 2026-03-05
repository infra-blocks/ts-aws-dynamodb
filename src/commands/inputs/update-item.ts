import type { UpdateCommandInput as NativeUpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import type { WithRequired } from "@infra-blocks/types";
import type { KeyAttributes } from "../../types.js";
import {
  Condition,
  type ConditionInput,
  Update,
  type UpdateInput,
} from "../expressions/index.js";
import type { ConditionCheckFailureReturnValue } from "./lib.js";
import { ExpressionsFormatter } from "./lib.js";

export type UpdateItemReturnValue =
  | "NONE"
  | "ALL_OLD"
  | "UPDATED_OLD"
  | "ALL_NEW"
  | "UPDATED_NEW";

export interface UpdateItemInput<K extends KeyAttributes = KeyAttributes> {
  table: string;
  key: K;
  update: UpdateInput;
  condition?: ConditionInput;
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
  const formatter = ExpressionsFormatter.create();
  const result: UpdateCommandInput = {
    TableName: input.table,
    Key: input.key,
    UpdateExpression: formatter.format(Update.from(input.update)),
  };

  if (input.returnValues != null) {
    result.ReturnValues = input.returnValues;
  }

  if (input.returnValuesOnConditionCheckFailure != null) {
    result.ReturnValuesOnConditionCheckFailure =
      input.returnValuesOnConditionCheckFailure;
  }

  if (input.condition != null) {
    result.ConditionExpression = formatter.format(
      Condition.from(input.condition),
    );
  }

  result.ExpressionAttributeNames = formatter.getExpressionAttributeNames();
  result.ExpressionAttributeValues = formatter.getExpressionAttributeValues();
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
