import type { KeyDefinition } from "../../../types.js";

export interface CreateTableInput<Def extends KeyDefinition = KeyDefinition> {
  name: string;
  keyDefinition: Def;
  // TODO: the index definition should be more complete.
  gsis?: Record<string, KeyDefinition>;
  lsis?: Record<string, KeyDefinition>;
}
