import { GetItemInput } from "../inputs/get-item.js";
import { GetItemOutput } from "../outputs/get-item.js";

export const GetItemCodec = {
  encode: GetItemInput.encode,
  decode: GetItemOutput.decode,
};
