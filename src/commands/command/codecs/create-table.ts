import { CreateTableInput } from "../inputs/create-table.js";
import { CreateTableOutput } from "../outputs/create-table.js";

export const CreateTableCodec = {
  encode: CreateTableInput.encode,
  decode: CreateTableOutput.decode,
};
