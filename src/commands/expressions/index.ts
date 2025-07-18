export * from "./condition.js";
export * from "./key-condition.js";
export * from "./operands.js";
export * from "./update.js";

/*
TODO: In the expression interfaces, a slight QoL improvement would be to assume that
strings are attribute names by default, and other types are values by default. The user
always has the option to be explicit. For example, he could write:
`where(attribute("name")).eq(value(42))` or `where("name").eq(42)`.
 */
