import { UpdateTimeToLiveInput } from "../inputs/update-time-to-live.js";
import { UpdateTimeToLiveOutput } from "../outputs/update-time-to-live.js";

export const UpdateTimeToLiveCodec = {
  encode: UpdateTimeToLiveInput.encode,
  decode: UpdateTimeToLiveOutput.decode,
};
