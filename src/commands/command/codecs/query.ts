import { QueryInput } from "../inputs/query.js";
import { QueryOutput } from "../outputs/query.js";

export const QueryCodec = {
  encode: QueryInput.encode,
  decode: QueryOutput.decode,
};
