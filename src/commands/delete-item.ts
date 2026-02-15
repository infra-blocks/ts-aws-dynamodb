import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, type DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes, KeyAttributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import type { ConditionParams } from "./expressions/index.js";
import type { Command } from "./types.js";

export type DeleteItemReturnValue = "ALL_OLD" | "NONE";

export interface DeleteItemParams {
  table: string;
  key: KeyAttributes;
  condition?: ConditionParams;
  returnValues?: DeleteItemReturnValue;
  // The item will be stored in the thrown exception and won't be unarmashalled.
  // See: https://github.com/aws/aws-sdk-js-v3/issues/6723
  returnValuesOnConditionCheckFailure?: DeleteItemReturnValue;
}

export type DeleteItemResult<T extends Attributes> = { item?: T };

export class DeleteItem implements Command<DeleteCommandInput, DeleteCommand> {
  private readonly params: DeleteItemParams;

  private constructor(params: DeleteItemParams) {
    this.params = params;
  }

  toAwsCommandInput(): DeleteCommandInput {
    const input: DeleteCommandInput = {
      TableName: this.params.table,
      Key: this.params.key,
    };

    if (this.params.returnValues != null) {
      input.ReturnValues = this.params.returnValues;
    }

    if (this.params.returnValuesOnConditionCheckFailure != null) {
      input.ReturnValuesOnConditionCheckFailure =
        this.params.returnValuesOnConditionCheckFailure;
    }

    // Expression attribute names and values can only be specified when a condition is provided,
    // which is optional.
    if (this.params.condition == null) {
      return input;
    }

    const names = AttributeNames.create();
    const values = AttributeValues.create();
    // Ask the expression to stringify itself, applying the substitutions by itself.
    const expression = conditionExpression(this.params.condition).stringify({
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

  async execute<T extends Attributes>(params: {
    client: DynamoDBClient;
  }): Promise<DeleteItemResult<T>> {
    const { client } = params;

    const result: Record<string, unknown> = {};
    const response = await client.send(this.toAwsCommand());
    if (response.Attributes != null) {
      result.item = response.Attributes;
    }

    return trusted(result);
  }

  static from(params: DeleteItemParams): DeleteItem {
    return new DeleteItem(params);
  }
}
