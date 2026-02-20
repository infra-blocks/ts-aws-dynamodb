import type { ConditionParams } from "./condition/index.js";

/*
A key attribute *must be* a top level attribute of type String, Number, or Binary.
*/

// TODO: narrow this type.
// This is a straight up subset of {@link Condition}
export type KeyConditionExpression = ConditionParams;
