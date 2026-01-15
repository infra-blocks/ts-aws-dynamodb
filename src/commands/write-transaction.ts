import {
  TransactWriteCommand,
  type TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { type UnpackedArray, unreachable } from "@infra-blocks/types";
import { DeleteItem, type DeleteItemParams } from "./delete-item.js";
import { PutItem, type PutItemParams } from "./put-item.js";
import type { Command } from "./types.js";
import { UpdateItem, type UpdateItemParams } from "./update-item.js";

type AwsTransactWrite = UnpackedArray<
  TransactWriteCommandInput["TransactItems"]
>;

namespace TransactionWrite {
  export function toAwsInput(write: TransactionWrite): AwsTransactWrite {
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
        Delete: DeleteItem.from(write.delete).toAwsCommandInput(),
      };
    }
    unreachable(write);
  }
}

// TODO: static tuple typing on result. I.e, if the first item is a put, the first result should be a put output you feel?.
export type TransactionWrite =
  | { put: PutItemParams }
  | { update: UpdateItemParams }
  | { delete: DeleteItemParams };

// TODO: support condititional checks
export interface WriteTransactionParams {
  writes: TransactionWrite[];
}

export class WriteTransaction
  implements Command<TransactWriteCommandInput, TransactWriteCommand>
{
  private readonly writes: TransactionWrite[];

  private constructor(params: WriteTransactionParams) {
    const { writes } = params;
    this.writes = writes;
  }

  toAwsCommandInput(): TransactWriteCommandInput {
    return {
      TransactItems: this.writes.map(TransactionWrite.toAwsInput),
    };
  }

  toAwsCommand(): TransactWriteCommand {
    return new TransactWriteCommand(this.toAwsCommandInput());
  }

  static from(params: WriteTransactionParams): WriteTransaction {
    return new WriteTransaction(params);
  }
}
