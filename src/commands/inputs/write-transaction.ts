import type { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { type UnpackedArray, unreachable } from "@infra-blocks/types";
import { ConditionCheckInput } from "./condition-check.js";
import { DeleteItemInput } from "./delete-item.js";
import { PutItemInput } from "./put-item.js";
import { UpdateItemInput } from "./update-item.js";

// TODO: consider moving condition check here esé?
export type WriteTransactionWrite =
  | { put: PutItemInput }
  | { update: UpdateItemInput }
  | { delete: DeleteItemInput }
  | { conditionCheck: ConditionCheckInput };

export type WriteTransactionInput = {
  writes: WriteTransactionWrite[];
};

export const WriteTransactionInput = {
  encode(input: WriteTransactionInput): TransactWriteCommandInput {
    return {
      TransactItems: input.writes.map(WriteTransactionWrite.encode),
    };
  },
};

type TransactWriteTransactItem = UnpackedArray<
  TransactWriteCommandInput["TransactItems"]
>;

const WriteTransactionWrite = {
  encode(write: WriteTransactionWrite): TransactWriteTransactItem {
    if ("put" in write) {
      return {
        Put: PutItemInput.encode(write.put),
      };
    }
    if ("update" in write) {
      return {
        Update: UpdateItemInput.encode(write.update),
      };
    }
    if ("delete" in write) {
      return {
        Delete: DeleteItemInput.encode(write.delete),
      };
    }
    if ("conditionCheck" in write) {
      return {
        ConditionCheck: ConditionCheckInput.encode(write.conditionCheck),
      };
    }
    unreachable(write);
  },
};
