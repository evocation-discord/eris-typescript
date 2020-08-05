import { Command } from "./Command";

export class CommandManager {
    cmds: Set<Command> = new Set();

    add(cmd: Command): void {
      if (this.cmds.has(cmd)) return;
      const conflictingCommand = Array.from(this.cmds).find(cm =>
        cmd.triggers.some(trigger => cm.triggers.includes(trigger))
      );
      if (conflictingCommand) {
        throw new Error(
          `Cannot add ${cmd.id} because it would conflict with ${conflictingCommand.id}.`
        );
      }
      this.cmds.add(cmd);
    }

    remove(cmd: Command): void {
      this.cmds.delete(cmd);
    }

    getByTrigger(trigger: string): Command {
      return Array.from(this.cmds).find(c => c.triggers.includes(trigger));
    }
}