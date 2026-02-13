import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import type { ConditionParams } from "./expressions/index.js";
import type { Command } from "./types.js";

export type PutItemReturnValue = "ALL_OLD" | "NONE";

export type PutItemParams = {
  table: string;
  item: Attributes;
  condition?: ConditionParams;
  returnValues?: PutItemReturnValue;
  // The item will be stored in the thrown exception and won't be unarmashalled.
  // See: https://github.com/aws/aws-sdk-js-v3/issues/6723
  returnValuesOnConditionCheckFailure?: PutItemReturnValue;
};

export type PutItemResult<T extends Attributes> = { item?: T };

export class PutItem implements Command<PutCommandInput, PutCommand> {
  private readonly params: PutItemParams;

  private constructor(params: PutItemParams) {
    this.params = params;
  }

  toAwsCommandInput(): PutCommandInput {
    const input: PutCommandInput = {
      TableName: this.params.table,
      Item: this.params.item,
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

  toAwsCommand(): PutCommand {
    return new PutCommand(this.toAwsCommandInput());
  }

  async execute<T extends Attributes>(params: {
    client: DynamoDBClient;
  }): Promise<PutItemResult<T>> {
    const { client } = params;

    const result: Record<string, unknown> = {};
    const response = await client.send(this.toAwsCommand());
    if (response.Attributes != null) {
      result.item = response.Attributes;
    }

    return trusted(result);
  }

  static from(params: PutItemParams): PutItem {
    return new PutItem(params);
  }
}
