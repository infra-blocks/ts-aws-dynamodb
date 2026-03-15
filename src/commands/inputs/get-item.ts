import type { GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import type { KeyAttributes } from "../../types.js";
import { Projection, type ProjectionInput } from "../expressions/projection.js";
import { unsetUndefined } from "../lib.js";
import {
  type ConsumedCapacityReturnValue,
  ExpressionsFormatter,
} from "./lib.js";

export type GetItemConsumedCapacityReturnValue = ConsumedCapacityReturnValue;

/**
 * The input required to call the GetItem API.
 */
export interface GetItemInput<K extends KeyAttributes = KeyAttributes> {
  /**
   * The name of the table to query.
   */
  table: string;
  /**
   * The primary key values of the item to retrieve.
   *
   * This should always include at least the partition key, and the sort key if one
   * is part of the table's primary key. No more than 2 fields are expected here.
   */
  key: K;
  /**
   * Whether to perform a consistent read. Defaults to false.
   */
  consistentRead?: boolean;
  /**
   * The projection applied to the return item, if any.
   */
  projection?: ProjectionInput;
  /**
   * The requested consumed capacity metrics on return, if any.
   */
  returnConsumedCapacity?: GetItemConsumedCapacityReturnValue;
}

export const GetItemInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: GetItemInput<K>,
): GetCommandInput {
  const formatter = ExpressionsFormatter.create();
  return unsetUndefined({
    TableName: input.table,
    Key: input.key,
    ConsistentRead: input.consistentRead,
    ProjectionExpression: ifDefined(input.projection, (v) =>
      formatter.format(Projection.from(v)),
    ),
    ReturnConsumedCapacity: input.returnConsumedCapacity,
    ExpressionAttributeNames: formatter.getExpressionAttributeNames(),
  });
}
