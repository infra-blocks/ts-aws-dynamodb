import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../types.js";
import { Condition, type KeyConditionParams } from "../expressions/index.js";
import { ExpressionsFormatter } from "./lib.js";

export type QueryInput<K extends KeyAttributes = KeyAttributes> = {
  table: string;
  index?: string;
  condition: KeyConditionParams;
  consistentRead?: boolean;
  exclusiveStartKey?: K;
  limit?: number;
  scanIndexForward?: boolean;
};

export const QueryInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: QueryInput<K>,
): QueryCommandInput {
  const {
    table,
    index,
    condition,
    consistentRead,
    exclusiveStartKey,
    limit,
    scanIndexForward,
  } = input;

  const formatter = ExpressionsFormatter.create();
  return {
    TableName: table,
    IndexName: index,
    ConsistentRead: consistentRead,
    KeyConditionExpression: formatter.format(Condition.from(condition)),
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
    ExpressionAttributeValues: formatter.getExpressionAttributeValues(),
    ExclusiveStartKey: exclusiveStartKey,
    Limit: limit,
    ScanIndexForward: scanIndexForward,
  };
}
