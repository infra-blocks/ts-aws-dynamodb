import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../types.js";
import { AbstractCommand } from "./base.js";
import { ScanInput } from "./inputs/index.js";
import { ScanOutput } from "./outputs/index.js";

export class Scan<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<ScanInput<K>, ScanOutput<T, K>, ScanCommand> {
  constructor(input: ScanInput<K>) {
    super({
      input,
      codec: {
        encode: ScanInput.encode,
        decode: ScanOutput.decode,
      },
      command: ScanCommand,
    });
  }
}
