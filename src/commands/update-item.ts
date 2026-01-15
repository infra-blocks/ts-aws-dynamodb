import {
  type UpdateCommandInput as NativeUpdateCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { WithRequired } from "@infra-blocks/types";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import {
  type ConditionParams,
  UpdateExpression,
  type UpdateExpressionParams,
} from "./expressions/index.js";
import type { Command } from "./types.js";

/*
The native command input type has the UpdateExpression field as optional,
since they are many legacy alternatives. In our implementation, we are
guaranteed to produce an object with the UpateExpression set, as we don't
support legacy parameters. Typing it as such is useful, as the equivalent
action within a transaction *requires* the UpdateExpression to be set.
So, this means, we can use the output of `toAwsCommandInput` directly
into a transaction action expression.
*/
type UpdateCommandInput = WithRequired<
  NativeUpdateCommandInput,
  "UpdateExpression"
>;

export interface UpdateItemParams {
  table: string;
  // TODO: specific type def for primary key attributes (subset of attribute types)
  key: Attributes;
  condition?: ConditionParams;
  update: UpdateExpressionParams;
}

export class UpdateItem implements Command<UpdateCommandInput, UpdateCommand> {
  private readonly params: UpdateItemParams;

  private constructor(params: UpdateItemParams) {
    this.params = params;
  }

  toAwsCommandInput(): UpdateCommandInput {
    const { table, key, condition, update } = this.params;

    const names = AttributeNames.create();
    const values = AttributeValues.create();
    const input: UpdateCommandInput = {
      TableName: table,
      Key: key,
      UpdateExpression: UpdateExpression.from(update).stringify({
        names,
        values,
      }),
    };

    // If there is no condition, we know that the names and values are finalized and
    // we are ready to return the payload.
    if (condition == null) {
      input.ExpressionAttributeNames = names.getSubstitutions();
      input.ExpressionAttributeValues = values.getSubstitutions();
      return input;
    }

    // Otherwise, we need to stringify the condition, reusing the same names and values
    // as before.
    input.ConditionExpression = conditionExpression(condition).stringify({
      names,
      values,
    });
    input.ExpressionAttributeNames = names.getSubstitutions();
    input.ExpressionAttributeValues = values.getSubstitutions();
    return input;
  }

  toAwsCommand(): UpdateCommand {
    return new UpdateCommand(this.toAwsCommandInput());
  }

  static from(params: UpdateItemParams): UpdateItem {
    return new UpdateItem(params);
  }
}
