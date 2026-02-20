import { DeleteTableInput } from "../inputs/delete-table.js";
import { DeleteTableOutput } from "../outputs/delete-table.js";

export const DeleteTableCodec = {
  encode: DeleteTableInput.encode,
  decode: DeleteTableOutput.decode,
};
