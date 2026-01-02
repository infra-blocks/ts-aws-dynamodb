import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { checkNotNull } from "@infra-blocks/checks";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import type { KeyConditionExpression } from "./expressions/key-condition.js";
import type { Command } from "./types.js";

export type QueryParams = {
  table: string;
  index?: string;
  condition: KeyConditionExpression;
  consistentRead?: boolean;
  exclusiveStartKey?: Attributes;
  limit?: number;
  scanIndexForward?: boolean;
};

export type QueryResult<T> = {
  count: number;
  items: Array<T>;
  scannedCount: number;
  lastEvaluatedKey?: Attributes;
};

export class Query implements Command<QueryCommandInput, QueryCommand> {
  private readonly params: QueryParams;

  private constructor(params: QueryParams) {
    this.params = params;
  }

  toAwsCommandInput(): QueryCommandInput {
    const {
      table,
      index,
      condition,
      consistentRead,
      exclusiveStartKey,
      limit,
      scanIndexForward,
    } = this.params;

    const names = AttributeNames.create();
    const values = AttributeValues.create();
    const expression = conditionExpression(condition).stringify({
      names,
      values,
    });
    return {
      TableName: table,
      IndexName: index,
      ConsistentRead: consistentRead,
      KeyConditionExpression: expression,
      ExpressionAttributeNames: names.getSubstitutions(),
      ExpressionAttributeValues: values.getSubstitutions(),
      ExclusiveStartKey: exclusiveStartKey,
      Limit: limit,
      ScanIndexForward: scanIndexForward,
    };
  }

  toAwsCommand(): QueryCommand {
    return new QueryCommand(this.toAwsCommandInput());
  }

  private transformResult<T extends Attributes>(
    result: QueryCommandOutput,
  ): QueryResult<T> {
    const items = (result.Items ?? []) as Array<T>;
    return {
      items,
      lastEvaluatedKey: result.LastEvaluatedKey,
      count: checkNotNull(result.Count, "count"),
      scannedCount: checkNotNull(result.ScannedCount, "scannedCount"),
    };
  }

  async execute<T extends Attributes>(params: {
    client: DynamoDBClient;
  }): Promise<QueryResult<T>> {
    const { client } = params;

    const response = await client.send(this.toAwsCommand());

    return this.transformResult(response);
  }

  static from(params: QueryParams): Query {
    return new Query(params);
  }
}
