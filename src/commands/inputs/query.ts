import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import type { KeyAttributes } from "../../types.js";
import {
  Filter,
  type FilterInput,
  KeyCondition,
  type KeyConditionInput,
  Projection,
  type ProjectionInput,
} from "../expressions/index.js";
import { unsetUndefined } from "../lib.js";
import {
  type ConsumedCapacityReturnValue,
  ExpressionsFormatter,
} from "./lib.js";

export type QueryConsumedCapacityReturnValue = ConsumedCapacityReturnValue;

export type QueryInput<K extends KeyAttributes = KeyAttributes> = {
  table: string;
  keyCondition: KeyConditionInput;
  consistentRead?: boolean;
  exclusiveStartKey?: K;
  filter?: FilterInput;
  index?: string;
  limit?: number;
  projection?: ProjectionInput;
  returnConsumedCapacity?: QueryConsumedCapacityReturnValue;
  scanIndexForward?: boolean;
};

export const QueryInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: QueryInput<K>,
): QueryCommandInput {
  const formatter = ExpressionsFormatter.create();
  return unsetUndefined({
    TableName: input.table,
    IndexName: input.index,
    ConsistentRead: input.consistentRead,
    ExclusiveStartKey: input.exclusiveStartKey,
    Limit: input.limit,
    ReturnConsumedCapacity: input.returnConsumedCapacity,
    ScanIndexForward: input.scanIndexForward,
    // Expressions
    KeyConditionExpression: formatter.format(
      KeyCondition.from(input.keyCondition),
    ),
    FilterExpression: ifDefined(input.filter, (v) =>
      formatter.format(Filter.from(v)),
    ),
    ProjectionExpression: ifDefined(input.projection, (v) =>
      formatter.format(Projection.from(v)),
    ),
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
    ExpressionAttributeValues: formatter.getExpressionAttributeValues(),
  });
}
