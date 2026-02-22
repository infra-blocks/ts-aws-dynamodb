import type { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import type { UnpackedArray } from "@infra-blocks/types";
import type { KeyAttributes } from "../../types.js";
import { Condition, type ConditionParams } from "../expressions/index.js";
import { ExpressionsFormatter } from "./lib.js";

export type ConditionCheckInput<K extends KeyAttributes = KeyAttributes> = {
  table: string;
  key: K;
  condition: ConditionParams;
};

export const ConditionCheckInput = {
  encode,
};

type TransactWriteCommandConditionCheck = UnpackedArray<
  TransactWriteCommandInput["TransactItems"]
>["ConditionCheck"];

function encode<K extends KeyAttributes = KeyAttributes>(
  input: ConditionCheckInput<K>,
): TransactWriteCommandConditionCheck {
  const formatter = ExpressionsFormatter.create();
  return {
    TableName: input.table,
    Key: input.key,
    ConditionExpression: formatter.format(Condition.from(input.condition)),
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
    ExpressionAttributeValues: formatter.getExpressionAttributeValues(),
  };
}
