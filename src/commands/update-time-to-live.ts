import { UpdateTimeToLiveCommand } from "@aws-sdk/client-dynamodb";
import { AbstractCommand } from "./base.js";
import { UpdateTimeToLiveInput } from "./inputs/index.js";
import { UpdateTimeToLiveOutput } from "./outputs/index.js";

export class UpdateTimeToLive extends AbstractCommand<
  UpdateTimeToLiveInput,
  UpdateTimeToLiveOutput,
  UpdateTimeToLiveCommand
> {
  constructor(input: UpdateTimeToLiveInput) {
    super({
      input,
      codec: {
        encode: UpdateTimeToLiveInput.encode,
        decode: UpdateTimeToLiveOutput.decode,
      },
      command: UpdateTimeToLiveCommand,
    });
  }
}
