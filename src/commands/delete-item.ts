import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../types.js";
import { AbstractCommand } from "./base.js";
import { DeleteItemInput } from "./inputs/index.js";
import { DeleteItemOutput } from "./outputs/index.js";

export class DeleteItem<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<
  DeleteItemInput<K>,
  DeleteItemOutput<T>,
  DeleteCommand
> {
  constructor(input: DeleteItemInput<K>) {
    super({
      input,
      codec: {
        encode: DeleteItemInput.encode,
        decode: DeleteItemOutput.decode,
      },
      command: DeleteCommand,
    });
  }
}
