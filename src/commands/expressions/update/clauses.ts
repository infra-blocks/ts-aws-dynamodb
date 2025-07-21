import type { UpdateAction } from "./action.js";
import type { AddAction } from "./add.js";
import type { DeleteAction } from "./delete.js";
import type { RemoveAction } from "./remove.js";
import type { SetAction } from "./set.js";

export class UpdateExpressionClauses {
  private add?: AddAction[];
  private delete?: DeleteAction[];
  private remove?: RemoveAction[];
  private set?: SetAction[];

  private constructor() {}

  getAddActions(): AddAction[] | undefined {
    return this.add;
  }

  getDeleteActions(): DeleteAction[] | undefined {
    return this.delete;
  }

  getRemoveActions(): RemoveAction[] | undefined {
    return this.remove;
  }

  getSetActions(): SetAction[] | undefined {
    return this.set;
  }

  pushAddAction(action: AddAction): void {
    this.add ??= [];
    this.add.push(action);
  }

  pushDeleteAction(action: DeleteAction): void {
    this.delete ??= [];
    this.delete.push(action);
  }

  pushRemoveAction(action: RemoveAction): void {
    this.remove ??= [];
    this.remove.push(action);
  }

  pushSetAction(action: SetAction): void {
    this.set ??= [];
    this.set.push(action);
  }

  static create(): UpdateExpressionClauses {
    return new UpdateExpressionClauses();
  }

  static from(params: ReadonlyArray<UpdateAction>): UpdateExpressionClauses {
    const clauses = UpdateExpressionClauses.create();
    for (const action of params) {
      action.register(clauses);
    }
    return clauses;
  }
}
