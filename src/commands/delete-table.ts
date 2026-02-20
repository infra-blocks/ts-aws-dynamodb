import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { AbstractCommand } from "./base.js";
import { DeleteTableInput } from "./inputs/index.js";
import { DeleteTableOutput } from "./outputs/index.js";

export class DeleteTable extends AbstractCommand<
  DeleteTableInput,
  DeleteTableOutput,
  DeleteTableCommand
> {
  constructor(input: DeleteTableInput) {
    super({
      input,
      codec: {
        encode: DeleteTableInput.encode,
        decode: DeleteTableOutput.decode,
      },
      command: DeleteTableCommand,
    });
  }
}
