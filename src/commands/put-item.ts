import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
import type { ConditionExpression } from "./expressions/condition.js";
import type { Command } from "./types.js";

export interface PutItemParams {
  table: string;
  item: Attributes;
  condition?: ConditionExpression;
}

export class PutItem implements Command<PutCommandInput, PutCommand> {
  private readonly table: string;
  private readonly item: Attributes;
  private readonly condition?: ConditionExpression;

  private constructor(params: PutItemParams) {
    const { table, item, condition } = params;
    this.table = table;
    this.item = item;
    this.condition = condition;
  }

  toAwsCommandInput(): PutCommandInput {
    const { table, item, condition } = this;
    const conditionPayload = condition != null ? condition.toAwsInput() : {};
    return {
      TableName: table,
      Item: item,
      ...conditionPayload,
    };
  }

  toAwsCommand(): PutCommand {
    return new PutCommand(this.toAwsCommandInput());
  }

  static from(params: PutItemParams): PutItem {
    return new PutItem(params);
  }
}
