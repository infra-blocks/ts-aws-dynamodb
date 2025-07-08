import {
  TransactWriteCommand,
  type TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { PutItem, type PutItemParams } from "./put-item.js";
import type { Command } from "./types.js";

// TODO: support update and whatnot.
export interface WriteTransactionParams {
  writes: PutItemParams[];
}

export class WriteTransaction
  implements Command<TransactWriteCommandInput, TransactWriteCommand>
{
  private readonly writes: PutItemParams[];

  private constructor(params: WriteTransactionParams) {
    const { writes } = params;
    this.writes = writes;
  }

  toAwsCommandInput(): TransactWriteCommandInput {
    return {
      TransactItems: this.writes.map((item) => ({
        Put: PutItem.from(item).toAwsCommandInput(),
      })),
    };
  }

  toAwsCommand(): TransactWriteCommand {
    return new TransactWriteCommand(this.toAwsCommandInput());
  }

  static from(params: WriteTransactionParams): WriteTransaction {
    return new WriteTransaction(params);
  }
}
