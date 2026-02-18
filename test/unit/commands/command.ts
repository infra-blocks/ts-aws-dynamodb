import { expectTypeOf } from "@infra-blocks/test";
import type {
  CommandInput,
  CommandOutput,
} from "../../../src/commands/command/command.js";
import type { GetItem } from "../../../src/commands/command/get-item.js";
import type {
  DeleteItem,
  DeleteItemInput,
  DeleteItemOutput,
  GetItemInput,
  GetItemOutput,
} from "../../../src/index.js";

describe("commands.command", () => {
  describe("CommandOutput", () => {
    it("should work with DeleteItem", () => {
      expectTypeOf<
        CommandOutput<DeleteItem>
      >().toEqualTypeOf<DeleteItemOutput>();
    });
    it("should work with GetItem", () => {
      expectTypeOf<CommandOutput<GetItem>>().toEqualTypeOf<GetItemOutput>();
    });
  });
  describe("CommandInput", () => {
    it("should work with DeleteItem", () => {
      expectTypeOf<CommandInput<DeleteItem>>().toEqualTypeOf<DeleteItemInput>();
    });
    it("should work with GetItem", () => {
      expectTypeOf<CommandInput<GetItem>>().toEqualTypeOf<GetItemInput>();
    });
  });
});
