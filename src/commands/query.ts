import { QueryCommand, type QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import type { AttributeValue } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import type { KeyConditionExpression } from "./expressions/key-condition.js";
import type { Command } from "./types.js";

export interface QueryParams {
  table: string;
  index?: string;
  condition: KeyConditionExpression;
  exclusiveStartKey?: Record<string, AttributeValue>;
}

export class Query implements Command<QueryCommandInput, QueryCommand> {
  private readonly table: string;
  private readonly index?: string;
  private readonly condition: KeyConditionExpression;
  private readonly exclusiveStartKey?: Record<string, AttributeValue>;

  private constructor(params: QueryParams) {
    const { table, index, condition, exclusiveStartKey } = params;
    this.table = table;
    this.index = index;
    this.condition = condition;
    this.exclusiveStartKey = exclusiveStartKey;
  }

  toAwsCommandInput(): QueryCommandInput {
    const attributeNames = AttributeNames.create();
    const attributeValues = AttributeValues.create();
    const expression = this.condition.stringify({
      attributeNames,
      attributeValues,
    });
    return {
      TableName: this.table,
      IndexName: this.index,
      KeyConditionExpression: expression,
      ExpressionAttributeNames: attributeNames.getSubstitutions(),
      ExpressionAttributeValues: attributeValues.getReferences(),
      ExclusiveStartKey: this.exclusiveStartKey,
    };
  }

  toAwsCommand(): QueryCommand {
    return new QueryCommand(this.toAwsCommandInput());
  }

  static from(params: QueryParams): Query {
    return new Query(params);
  }
}
