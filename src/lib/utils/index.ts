import { ErisClient } from "./client/ErisClient";
import { Command } from "./commands/Command";
import { CommandManager } from "./commands/CommandManager";
import { CommandParserModule } from "./commands/CommandParser";

export { ErisClient, Command, CommandManager, CommandParserModule };

export * from "./arguments/ArgumentProcessor";
export * from "./arguments/Arguments";
export * from "./arguments/supportedArgs";

export * from "./commands/decorator";

export * from "./inhibitors/Inhibitor";
export * from "./listener/Listener";
export * from "./listener/ListenerManager";
export * from "./listener/decorator";

export * from "./monitor/Monitor";
export * from "./monitor/MonitorManager";
export * from "./monitor/decorator";

export * from "./modules/Module";

export * from "./constants";

export const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const timeFormatter = (): string => {
  const date = new Date();
  const _hour = `0${date.getUTCHours()}`;
  const _minutes = `0${date.getUTCMinutes()}`;
  const _day = `0${date.getUTCDate()}`;
  const _month = `0${date.getUTCMonth() + 1}`;
  const year = date.getUTCFullYear();

  const hour = _hour.slice(-2);
  const minutes = _minutes.slice(-2);
  const day = _day.slice(-2);
  const month = _month.slice(-2);
  return `${hour}:${minutes} ${day}/${month}/${year} UTC`;
};