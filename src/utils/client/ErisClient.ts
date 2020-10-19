import { Client } from "discord.js";
import { CommandManager } from "@utils/commands/CommandManager";
import { ListenerManager } from "@utils/listener/ListenerManager";
import { Module } from "@utils/modules";
import { CommandParserModule } from "@utils/commands/CommandParser";
import { MonitorManager } from "@utils/monitor/MonitorManager";
import { CronManager } from "@utils/cron/CronManager";

export class ErisClient extends Client {
  public commandManager: CommandManager;

  public listenerManager: ListenerManager;

  public monitorManager: MonitorManager;

  public cronManager: CronManager;

  public modules: Set<Module> = new Set();

  readonly botMaintainers: string[];

  constructor(opts: Partial<ErisClientOptions> = {}) {
    super({
      partials: ["MESSAGE", "CHANNEL", "REACTION"],
      ws: {
        intents: [
          "GUILDS",
          "GUILD_MEMBERS",
          "GUILD_BANS",
          "GUILD_EMOJIS",
          "GUILD_INTEGRATIONS",
          "GUILD_WEBHOOKS",
          "GUILD_INVITES",
          "GUILD_VOICE_STATES",
          "GUILD_PRESENCES",
          "GUILD_MESSAGES",
          "GUILD_MESSAGE_REACTIONS",
          "DIRECT_MESSAGES",
          "DIRECT_MESSAGE_REACTIONS"
        ]
      }
    });
    this.botMaintainers = opts.botMaintainers || [];
    this.commandManager = new CommandManager();
    this.listenerManager = new ListenerManager(this);
    this.monitorManager = new MonitorManager(this);
    this.cronManager = new CronManager(this);
    this.registerModule(CommandParserModule);
  }

  registerModule(module: typeof Module | Module): this {
    if (module === Module || module instanceof Module) {
      throw new TypeError(
        "registerModule only takes in classes that extend Module"
      );
    }
    if (
      [...this.modules].some(
        (m) => m.constructor.name === module.name
          || m.constructor.name === module.constructor.name
      )
    ) {
      throw new Error(
        `cannot register multiple modules with same name (${module.name
        || module.constructor.name})`
      );
    }
    const mod = module instanceof Module ? module : new module(this);
    mod.processListeners
      .bind(mod)()
      .forEach((l) => this.listenerManager.add(l));
    mod.processCommands
      .bind(mod)()
      .forEach((c) => this.commandManager.add(c));
    mod.processMonitors
      .bind(mod)()
      .forEach((c) => this.monitorManager.add(c));
    mod.processCrons
      .bind(mod)()
      .forEach((c) => this.cronManager.add(c));
    this.modules.add(mod);
    return this;
  }

  unregisterModule(mod: Module): this {
    if (!this.modules.has(mod)) { throw new Error("Cannot unregister unregistered module"); }
    [...this.listenerManager.listeners]
      .filter((l) => l.module === mod)
      .forEach((l) => this.listenerManager.remove(l));
    [...this.commandManager.cmds]
      .filter((c) => c.module === mod)
      .forEach((c) => this.commandManager.remove(c));
    this.modules.delete(mod);
    return this;
  }
}

interface ErisClientOptions {
  botMaintainers: string[]
}
