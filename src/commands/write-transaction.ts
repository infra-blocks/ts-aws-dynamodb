import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { AbstractCommand } from "./base.js";
import { WriteTransactionInput } from "./inputs/index.js";
import { WriteTransactionOutput } from "./outputs/index.js";

export class WriteTransaction extends AbstractCommand<
  WriteTransactionInput,
  WriteTransactionOutput,
  TransactWriteCommand
> {
  constructor(input: WriteTransactionInput) {
    super({
      input,
      codec: {
        encode: WriteTransactionInput.encode,
        decode: WriteTransactionOutput.decode,
      },
      command: TransactWriteCommand,
    });
  }
}
