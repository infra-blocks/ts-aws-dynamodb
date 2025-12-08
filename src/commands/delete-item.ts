import { DeleteCommand, type DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import type { ConditionParams } from "./expressions/index.js";
import type { Command } from "./types.js";

// TODO: almost time to implement the return values, and responses transforms in general.
export interface DeleteItemParams {
  table: string;
  key: Attributes;
  condition?: ConditionParams;
}

export class DeleteItem implements Command<DeleteCommandInput, DeleteCommand> {
  private readonly table: string;
  private readonly key: Attributes;
  private readonly condition?: ConditionParams;

  private constructor(params: DeleteItemParams) {
    const { table, key, condition } = params;
    this.table = table;
    this.key = key;
    this.condition = condition;
  }

  toAwsCommandInput(): DeleteCommandInput {
    const input: DeleteCommandInput = {
      TableName: this.table,
      Key: this.key,
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

  toAwsCommand(): DeleteCommand {
    return new DeleteCommand(this.toAwsCommandInput());
  }

  static from(params: DeleteItemParams): DeleteItem {
    return new DeleteItem(params);
  }
}
