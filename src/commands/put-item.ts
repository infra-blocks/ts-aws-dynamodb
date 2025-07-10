import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
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

    const input: PutCommandInput = {
      TableName: table,
      Item: item,
    };

    // Expression attribute names and values can only be specified when a condition is provided,
    // which is optional.
    if (condition == null) {
      return input;
    }

    const attributeNames = AttributeNames.create();
    const attributeValues = AttributeValues.create();
    // Ask the expression to stringify itself, applying the substitutions by itself.
    const expression = condition.stringify({
      attributeNames,
      attributeValues,
    });

    return {
      ...input,
      ConditionExpression: expression,
      ExpressionAttributeNames: attributeNames.getSubstitutions(),
      ExpressionAttributeValues: attributeValues.getReferences(),
    };
  }

  toAwsCommand(): PutCommand {
    return new PutCommand(this.toAwsCommandInput());
  }

  static from(params: PutItemParams): PutItem {
    return new PutItem(params);
  }
}
