import { after, suite } from "node:test";
import { commandsTests } from "./commands/index.js";
import { errorTests } from "./error.js";
import { TestKit } from "./kit.js";
import { Services } from "./setup.js";
import { getTestConfig, injectTestConfig } from "./test-config.js";

suite("suite", async () => {
  injectTestConfig();
  const config = getTestConfig();
  const kit = TestKit.init(config);

  await Services.start(kit);
  after(() => Services.stop(kit));

  commandsTests(kit);
  errorTests(kit);
});
