import { DeleteItemInput } from "../inputs/delete-item.js";
import { DeleteItemOutput } from "../outputs/delete-item.js";

export const DeleteItemCodec = {
  encode: DeleteItemInput.encode,
  decode: DeleteItemOutput.decode,
};
