import {
  type DynamoDBDocumentClient,
  PutCommand,
  type PutCommandInput,
  type PutCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import type { ConditionParams } from "./expressions/index.js";
import type { Command } from "./types.js";

export interface PutItemInput {
  table: string;
  item: Attributes;
  condition?: ConditionParams;
}

export type PutItemOutput = PutCommandOutput;

export class PutItem implements Command<PutItemOutput> {
  private readonly table: string;
  private readonly item: Attributes;
  private readonly condition?: ConditionParams;

  private constructor(params: PutItemInput) {
    const { table, item, condition } = params;
    this.table = table;
    this.item = item;
    this.condition = condition;
  }

  execute(client: DynamoDBDocumentClient): Promise<PutItemOutput> {
    return client.send(this.toAwsCommand());
  }

  getDetails(): object {
    return this.toAwsCommandInput();
  }

  getName(): string {
    return "PutItem";
  }

  toAwsCommandInput(): PutCommandInput {
    const input: PutCommandInput = {
      TableName: this.table,
      Item: this.item,
    };

    // Expression attribute names and values can only be specified when a condition is provided,
    // which is optional.
    if (this.condition == null) {
      return input;
    }

    const names = AttributeNames.create();
    const values = AttributeValues.create();
    // Ask the expression to stringify itself, applying the substitutions by itself.
    const expression = conditionExpression(this.condition).stringify({
      names,
      values,
    });

    return {
      ...input,
      ConditionExpression: expression,
      ExpressionAttributeNames: names.getSubstitutions(),
      ExpressionAttributeValues: values.getSubstitutions(),
    };
  }

  private toAwsCommand(): PutCommand {
    return new PutCommand(this.toAwsCommandInput());
  }

  static from(params: PutItemInput): PutItem {
    return new PutItem(params);
  }
}
