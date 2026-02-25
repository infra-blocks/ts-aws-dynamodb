import { conditionTests } from "./condition/index.js";
import { keyConditionTests } from "./key-condition/index.js";
import { operandsTests } from "./operands/index.js";
import { projectionTests } from "./projection.js";
import { updateTests } from "./update/index.js";

export const expressionsTests = () => {
  conditionTests();
  keyConditionTests();
  operandsTests();
  updateTests();
  projectionTests();
};
