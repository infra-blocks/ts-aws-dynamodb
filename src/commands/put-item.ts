import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
import { AbstractCommand } from "./base.js";
import { PutItemInput } from "./inputs/index.js";
import { PutItemOutput } from "./outputs/index.js";

export class PutItem<T extends Attributes = Attributes> extends AbstractCommand<
  PutItemInput<T>,
  PutItemOutput<T>,
  PutCommand
> {
  constructor(input: PutItemInput<T>) {
    super({
      input,
      codec: {
        encode: PutItemInput.encode,
        decode: PutItemOutput.decode,
      },
      command: PutCommand,
    });
  }
}
