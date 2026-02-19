import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../../types.js";
import { PutItemCodec } from "./codecs/put-item.js";
import { AbstractCommand } from "./command.js";
import type { PutItemInput } from "./inputs/put-item.js";
import type { PutItemOutput } from "./outputs/put-item.js";

export class PutItem<T extends Attributes = Attributes> extends AbstractCommand<
  PutItemInput<T>,
  PutItemOutput<T>,
  PutCommand
> {
  constructor(input: PutItemInput<T>) {
    super({
      input,
      codec: PutItemCodec,
      command: PutCommand,
    });
  }
}
