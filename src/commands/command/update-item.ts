import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../../types.js";
import { UpdateItemCodec } from "./codecs/update-item.js";
import { AbstractCommand } from "./command.js";
import type { UpdateItemInput } from "./inputs/update-item.js";
import type { UpdateItemOutput } from "./outputs/update-item.js";

export class UpdateItem<
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<UpdateItemInput<K>, UpdateItemOutput, UpdateCommand> {
  constructor(input: UpdateItemInput<K>) {
    super({
      input,
      codec: UpdateItemCodec,
      command: UpdateCommand,
    });
  }
}
