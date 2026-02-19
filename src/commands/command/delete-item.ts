import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../../types.js";
import { DeleteItemCodec } from "./codecs/delete-item.js";
import { AbstractCommand } from "./command.js";
import type { DeleteItemInput } from "./inputs/delete-item.js";
import type { DeleteItemOutput } from "./outputs/delete-item.js";

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
      codec: DeleteItemCodec,
      command: DeleteCommand,
    });
  }
}
