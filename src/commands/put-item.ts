import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import type { ConditionParams } from "./expressions/index.js";
import type { Command } from "./types.js";

export type PutItemParams = {
  table: string;
  item: Attributes;
  condition?: ConditionParams;
  returnValues?: "ALL_OLD" | "NONE";
};

export type PutItemResult = {
  item?: Attributes;
};

export class PutItem implements Command<PutCommandInput, PutCommand> {
  private readonly table: string;
  private readonly item: Attributes;
  private readonly condition?: ConditionParams;
  private readonly returnValues?: "ALL_OLD" | "NONE";

  private constructor(params: PutItemParams) {
    const { table, item, condition, returnValues } = params;
    this.table = table;
    this.item = item;
    this.condition = condition;
    this.returnValues = returnValues;
  }

  toAwsCommandInput(): PutCommandInput {
    const input: PutCommandInput = {
      TableName: this.table,
      Item: this.item,
    };

    if (this.returnValues != null) {
      input.ReturnValues = this.returnValues;
    }

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

  toAwsCommand(): PutCommand {
    return new PutCommand(this.toAwsCommandInput());
  }

  async execute(params: { client: DynamoDBClient }): Promise<PutItemResult> {
    const { client } = params;

    const response = await client.send(this.toAwsCommand());
    if (response.Attributes != null) {
      return {
        item: response.Attributes,
      };
    }
    return {};
  }

  static from(params: PutItemParams): PutItem {
    return new PutItem(params);
  }
}
