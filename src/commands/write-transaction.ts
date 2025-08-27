import {
  type DynamoDBDocumentClient,
  TransactWriteCommand,
  type TransactWriteCommandInput,
  type TransactWriteCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { PutItem, type PutItemParams } from "./put-item.js";
import type { Command } from "./types.js";

// TODO: support update and whatnot.
export interface WriteTransactionParams {
  writes: PutItemParams[];
}

export class WriteTransaction implements Command<TransactWriteCommandOutput> {
  private readonly writes: PutItemParams[];

  private constructor(params: WriteTransactionParams) {
    const { writes } = params;
    this.writes = writes;
  }

  execute(client: DynamoDBDocumentClient): Promise<TransactWriteCommandOutput> {
    return client.send(this.toAwsCommand());
  }

  getDetails(): object {
    return this.toAwsCommandInput();
  }

  getName(): string {
    return "WriteTransaction";
  }

  private toAwsCommandInput(): TransactWriteCommandInput {
    return {
      TransactItems: this.writes.map((item) => ({
        Put: PutItem.from(item).toAwsCommandInput(),
      })),
    };
  }

  private toAwsCommand(): TransactWriteCommand {
    return new TransactWriteCommand(this.toAwsCommandInput());
  }

  static from(params: WriteTransactionParams): WriteTransaction {
    return new WriteTransaction(params);
  }
}
