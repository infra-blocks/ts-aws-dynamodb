import { UpdateTimeToLiveCommand } from "@aws-sdk/client-dynamodb";
import { AbstractCommand } from "./base.js";
import { UpdateTimeToLiveCodec } from "./codecs/update-time-to-live.js";
import type { UpdateTimeToLiveInput } from "./inputs/update-time-to-live.js";
import type { UpdateTimeToLiveOutput } from "./outputs/update-time-to-live.js";

export class UpdateTimeToLive extends AbstractCommand<
  UpdateTimeToLiveInput,
  UpdateTimeToLiveOutput,
  UpdateTimeToLiveCommand
> {
  constructor(input: UpdateTimeToLiveInput) {
    super({
      input,
      codec: UpdateTimeToLiveCodec,
      command: UpdateTimeToLiveCommand,
    });
  }
}
