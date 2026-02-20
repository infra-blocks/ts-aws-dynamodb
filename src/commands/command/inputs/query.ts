import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../../index.js";
import type { KeyConditionExpression } from "../../expressions/index.js";
import { intoExpressionComponents } from "./lib.js";

export type QueryInput<K extends KeyAttributes = KeyAttributes> = {
  table: string;
  index?: string;
  condition: KeyConditionExpression;
  consistentRead?: boolean;
  exclusiveStartKey?: K;
  limit?: number;
  scanIndexForward?: boolean;
};

export function encode<K extends KeyAttributes = KeyAttributes>(
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

  const { expression, names, values } = intoExpressionComponents(condition);
  return {
    TableName: table,
    IndexName: index,
    ConsistentRead: consistentRead,
    KeyConditionExpression: expression,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ExclusiveStartKey: exclusiveStartKey,
    Limit: limit,
    ScanIndexForward: scanIndexForward,
  };
}
