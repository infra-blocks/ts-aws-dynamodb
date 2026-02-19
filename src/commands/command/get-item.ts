import { GetCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../../types.js";
import { GetItemCodec } from "./codecs/get-item.js";
import { AbstractCommand } from "./command.js";
import type { GetItemInput } from "./inputs/get-item.js";
import type { GetItemOutput } from "./outputs/get-item.js";

export class GetItem<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<GetItemInput<K>, GetItemOutput<T>, GetCommand> {
  constructor(input: GetItemInput<K>) {
    super({
      input,
      codec: GetItemCodec,
      command: GetCommand,
    });
  }
}
