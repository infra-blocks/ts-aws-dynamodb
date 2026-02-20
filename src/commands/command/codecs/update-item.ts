import { UpdateItemInput } from "../inputs/update-item.js";
import { UpdateItemOutput } from "../outputs/update-item.js";

export const UpdateItemCodec = {
  encode: UpdateItemInput.encode,
  decode: UpdateItemOutput.decode,
};
