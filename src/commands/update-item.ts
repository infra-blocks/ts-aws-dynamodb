import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../types.js";
import { AbstractCommand } from "./base.js";
import { UpdateItemInput } from "./inputs/index.js";
import { UpdateItemOutput } from "./outputs/index.js";

export class UpdateItem<
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<UpdateItemInput<K>, UpdateItemOutput, UpdateCommand> {
  constructor(input: UpdateItemInput<K>) {
    super({
      input,
      codec: {
        encode: UpdateItemInput.encode,
        decode: UpdateItemOutput.decode,
      },
      command: UpdateCommand,
    });
  }
}
