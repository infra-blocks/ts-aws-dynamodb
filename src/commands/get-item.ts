import { GetCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../types.js";
import { AbstractCommand } from "./base.js";
import { GetItemInput } from "./inputs/index.js";
import { GetItemOutput } from "./outputs/index.js";

export class GetItem<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<GetItemInput<K>, GetItemOutput<T>, GetCommand> {
  constructor(input: GetItemInput<K>) {
    super({
      input,
      codec: {
        encode: GetItemInput.encode,
        decode: GetItemOutput.decode,
      },
      command: GetCommand,
    });
  }
}
