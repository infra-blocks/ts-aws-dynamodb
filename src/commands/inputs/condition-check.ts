import type { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import type { UnpackedArray } from "@infra-blocks/types";
import type { KeyAttributes } from "../../types.js";
import type { ConditionParams } from "../expressions/index.js";
import { intoExpressionComponents } from "./lib.js";

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
  const { table, key, condition } = input;

  const { expression, names, values } = intoExpressionComponents(condition);

  return {
    TableName: table,
    Key: key,
    ConditionExpression: expression,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  };
}
