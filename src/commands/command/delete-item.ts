import {
  DeleteCommand,
  type DeleteCommandInput,
  type DeleteCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../../types.js";
import { DeleteItemCodec } from "./codecs/delete-item.js";
import { Command } from "./command.js";
import type { DeleteItemInput } from "./inputs/delete-item.js";
import type { DeleteItemOutput } from "./outputs/delete-item.js";

export class DeleteItem<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> extends Command<
  DeleteItemInput<K>,
  DeleteItemOutput<T>,
  DeleteCommandInput,
  DeleteCommandOutput
> {
  constructor(input: DeleteItemInput<K>) {
    super({
      input,
      codec: DeleteItemCodec,
      command: DeleteCommand,
    });
  }
}
