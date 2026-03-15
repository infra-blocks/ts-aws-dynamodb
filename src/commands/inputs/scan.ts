import type { ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import type { KeyAttributes } from "../../types.js";
import {
  Filter,
  type FilterInput,
  Projection,
  type ProjectionInput,
} from "../expressions/index.js";
import { unsetUndefined } from "../lib.js";
import {
  type ConsumedCapacityReturnValue,
  ExpressionsFormatter,
} from "./lib.js";

export type ScanConsumedCapacityReturnValue = ConsumedCapacityReturnValue;

export type ScanInput<K extends KeyAttributes = KeyAttributes> = {
  /**
   * The name of the table to query, or the name of the table owning
   * the index to query, when provided.
   */
  table: string;
  /**
   * Whether to perform a consistent read. Defaults to false.
   */
  consistentRead?: boolean;
  /**
   * The primary key of the first item to evaluate.
   */
  exclusiveStartKey?: K;
  /**
   * The filter expression used to process results, if any.
   */
  filter?: FilterInput;
  /**
   * The index to query, if any.
   */
  index?: string;
  /**
   * The maximum number of items to evaluate.
   */
  limit?: number;
  /**
   * The project expression to apply to matching items, if any.
   */
  projection?: ProjectionInput;
  /**
   * The requested consumed capacity metrics on return, if any.
   */
  returnConsumedCapacity?: ScanConsumedCapacityReturnValue;
  /**
   * The segment ID of the parallel query. Must always be provided in conjunction
   * with `totalSegments`.
   */
  segment?: number;
  /**
   * The number of segments dividing the parallel query. Must always be provided
   * in conjunction with `segment`.
   */
  totalSegments?: number;
};

export const ScanInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: ScanInput<K>,
): ScanCommandInput {
  const formatter = ExpressionsFormatter.create();
  return unsetUndefined({
    TableName: input.table,
    ConsistentRead: input.consistentRead,
    ExclusiveStartKey: input.exclusiveStartKey,
    FilterExpression: ifDefined(input.filter, (f) =>
      formatter.format(Filter.from(f)),
    ),
    IndexName: input.index,
    Limit: input.limit,
    ProjectionExpression: ifDefined(input.projection, (p) =>
      formatter.format(Projection.from(p)),
    ),
    ReturnConsumedCapacity: input.returnConsumedCapacity,
    Segment: input.segment,
    TotalSegments: input.totalSegments,
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
    ExpressionAttributeValues: formatter.getExpressionAttributeValues(),
  });
}
