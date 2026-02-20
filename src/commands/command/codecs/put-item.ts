import { PutItemInput } from "../inputs/put-item.js";
import { PutItemOutput } from "../outputs/put-item.js";

export const PutItemCodec = {
  encode: PutItemInput.encode,
  decode: PutItemOutput.decode,
};
