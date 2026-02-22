import type { GetCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../types.js";
import { AttributeNames } from "../attributes/names.js";
import {
  ProjectionExpression,
  type ProjectionExpressionParams,
} from "../expressions/projection.js";

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
   * The projection applied to the return item, if any.
   */
  projection?: ProjectionExpressionParams;
}

export const GetItemInput = {
  encode,
};

function encode<K extends KeyAttributes = KeyAttributes>(
  input: GetItemInput<K>,
): GetCommandInput {
  const result: GetCommandInput = {
    TableName: input.table,
    Key: input.key,
  };

  if (input.projection != null) {
    // There should be no values.
    const names = AttributeNames.create();
    const expression = ProjectionExpression.from(input.projection).stringify({
      names,
    });
    result.ProjectionExpression = expression;
    result.ExpressionAttributeNames = names.getSubstitutions();
  }

  return result;
}
