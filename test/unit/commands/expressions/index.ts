import { conditionTests } from "./condition/index.js";
import { functionsTests } from "./functions/index.js";
import { keyConditionTests } from "./key-condition/index.js";
import { operandsTests } from "./operands/index.js";
import { projectionTests } from "./projection.js";
import { updateTests } from "./update/index.js";

export const expressionsTests = () => {
  conditionTests();
  functionsTests();
  keyConditionTests();
  operandsTests();
  updateTests();
  projectionTests();
};
