import type { GetCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../../types.js";

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
}

export const GetItemInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: GetItemInput<K>,
): GetCommandInput {
  const key = input.key;
  return {
    TableName: input.table,
    Key: key,
  };
}
