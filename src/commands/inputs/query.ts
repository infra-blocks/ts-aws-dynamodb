import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../types.js";
import {
  Filter,
  type FilterInput,
  KeyCondition,
  type KeyConditionInput,
  Projection,
  type ProjectionInput,
} from "../expressions/index.js";
import { ExpressionsFormatter } from "./lib.js";

export type QueryInput<K extends KeyAttributes = KeyAttributes> = {
  table: string;
  keyCondition: KeyConditionInput;
  consistentRead?: boolean;
  exclusiveStartKey?: K;
  filter?: FilterInput;
  index?: string;
  limit?: number;
  projection?: ProjectionInput;
  scanIndexForward?: boolean;
};

export const QueryInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: QueryInput<K>,
): QueryCommandInput {
  const formatter = ExpressionsFormatter.create();
  const result: QueryCommandInput = {
    TableName: input.table,
    IndexName: input.index,
    KeyConditionExpression: formatter.format(
      KeyCondition.from(input.keyCondition),
    ),
    ConsistentRead: input.consistentRead,
    ExclusiveStartKey: input.exclusiveStartKey,
    Limit: input.limit,
    ScanIndexForward: input.scanIndexForward,
  };

  if (input.filter != null) {
    result.FilterExpression = formatter.format(Filter.from(input.filter));
  }

  if (input.projection != null) {
    result.ProjectionExpression = formatter.format(
      Projection.from(input.projection),
    );
  }

  result.ExpressionAttributeNames = formatter.getExpressionAttributeNames();
  result.ExpressionAttributeValues = formatter.getExpressionAttributeValues();

  return result;
}
