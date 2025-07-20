import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import type { Condition } from "./expressions/condition.js";
import type { Command } from "./types.js";

export interface PutItemParams {
  table: string;
  item: Attributes;
  condition?: Condition;
}

export class PutItem implements Command<PutCommandInput, PutCommand> {
  private readonly table: string;
  private readonly item: Attributes;
  private readonly condition?: Condition;

  private constructor(params: PutItemParams) {
    const { table, item, condition } = params;
    this.table = table;
    this.item = item;
    this.condition = condition;
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
    const expression = this.condition.stringify({ names, values });

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

  static from(params: PutItemParams): PutItem {
    return new PutItem(params);
  }
}
