import {
  TransactWriteCommand,
  type TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { type UnpackedArray, unreachable } from "@infra-blocks/types";
import type { Attributes } from "../types.js";
import { AttributeNames } from "./attributes/names.js";
import { AttributeValues } from "./attributes/values.js";
import { DeleteItemCodec } from "./command/codecs/delete-item.js";
import type { DeleteItemInput } from "./command/inputs/index.js";
import { conditionExpression } from "./expressions/condition/expression.js";
import type { ConditionParams } from "./expressions/index.js";
import { PutItem, type PutItemParams } from "./put-item.js";
import type { Command } from "./types.js";
import { UpdateItem, type UpdateItemParams } from "./update-item.js";

type AwsConditionCheck = AwsTransactWrite["ConditionCheck"];

const ConditionCheck = {
  toAwsCommandInput(params: ConditionCheckParams): AwsConditionCheck {
    const { table, key, condition } = params;

    const names = AttributeNames.create();
    const values = AttributeValues.create();
    // Ask the expression to stringify itself, applying the substitutions by itself.
    const expression = conditionExpression(condition).stringify({
      names,
      values,
    });

    return {
      TableName: table,
      Key: key,
      ConditionExpression: expression,
      ExpressionAttributeNames: names.getSubstitutions(),
      ExpressionAttributeValues: values.getSubstitutions(),
    };
  },
};

type AwsTransactWrite = UnpackedArray<
  TransactWriteCommandInput["TransactItems"]
>;

const WriteTransactionAction = {
  toAwsCommandInput(write: WriteTransactionAction): AwsTransactWrite {
    if ("put" in write) {
      return {
        Put: PutItem.from(write.put).toAwsCommandInput(),
      };
    }
    if ("update" in write) {
      return {
        Update: UpdateItem.from(write.update).toAwsCommandInput(),
      };
    }
    if ("delete" in write) {
      return {
        Delete: DeleteItemCodec.encode(write.delete),
      };
    }
    if ("conditionCheck" in write) {
      return {
        ConditionCheck: ConditionCheck.toAwsCommandInput(write.conditionCheck),
      };
    }
    unreachable(write);
  },
};

export type ConditionCheckParams = {
  table: string;
  key: Attributes;
  condition: ConditionParams;
};

export type WriteTransactionAction =
  | { put: PutItemParams }
  | { update: UpdateItemParams }
  | { delete: DeleteItemInput }
  | { conditionCheck: ConditionCheckParams };

export interface WriteTransactionParams {
  writes: WriteTransactionAction[];
}

// TODO: static tuple typing on result. I.e, if the first item is a put, the first result should be a put output you feel?.
export class WriteTransaction
  implements Command<TransactWriteCommandInput, TransactWriteCommand>
{
  private readonly writes: WriteTransactionAction[];

  private constructor(params: WriteTransactionParams) {
    const { writes } = params;
    this.writes = writes;
  }

  toAwsCommandInput(): TransactWriteCommandInput {
    return {
      TransactItems: this.writes.map(WriteTransactionAction.toAwsCommandInput),
    };
  }

  toAwsCommand(): TransactWriteCommand {
    return new TransactWriteCommand(this.toAwsCommandInput());
  }

  static from(params: WriteTransactionParams): WriteTransaction {
    return new WriteTransaction(params);
  }
}
