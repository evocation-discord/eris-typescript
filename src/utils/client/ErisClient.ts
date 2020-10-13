import { Client } from "discord.js";
import chokidar from "chokidar";
import { join } from "path";
import { readdirSync } from "fs";
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
  readonly botAdmins: string[];
  constructor(opts: Partial<ErisClientOptions> = {}) {
    super({ partials: ["MESSAGE", "CHANNEL", "REACTION"], ws: { intents: [
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
    ] } });
    this.botAdmins = opts.botAdmins || [];
    this.commandManager = new CommandManager();
    this.listenerManager = new ListenerManager(this);
    this.monitorManager = new MonitorManager(this);
    this.cronManager = new CronManager(this);
    this.registerModule(CommandParserModule);
  }

  registerModule(module: typeof Module | Module): this {
    if (module === Module || module instanceof Module)
      throw new TypeError(
        "registerModule only takes in classes that extend Module"
      );
    if (
      Array.from(this.modules).some(
        m =>
          m.constructor.name === module.name ||
          m.constructor.name === module.constructor.name
      )
    )
      throw new Error(
        `cannot register multiple modules with same name (${module.name ||
        module.constructor.name})`
      );
    const mod = module instanceof Module ? module : new module(this);
    mod.processListeners
      .bind(mod)()
      .forEach(l => this.listenerManager.add(l));
    mod.processCommands
      .bind(mod)()
      .forEach(c => this.commandManager.add(c));
    mod.processMonitors
      .bind(mod)()
      .forEach(c => this.monitorManager.add(c));
    mod.processCrons
      .bind(mod)()
      .forEach(c => this.cronManager.add(c));
    this.modules.add(mod);
    return this;
  }

  unregisterModule(mod: Module): this {
    if (!this.modules.has(mod))
      throw new Error("Cannot unregister unregistered module");
    Array.from(this.listenerManager.listeners)
      .filter(l => l.module === mod)
      .forEach(l => this.listenerManager.remove(l));
    Array.from(this.commandManager.cmds)
      .filter(c => c.module === mod)
      .forEach(c => this.commandManager.remove(c));
    this.modules.delete(mod);
    return this;
  }
  reloadModulesFromFolder(path: string): void {
    const fn = join(process.cwd(), path);
    const watcher = chokidar.watch(fn);

    watcher.on("change", file => {
      // Here be dragons.
      // Might need more validation here...
      delete require.cache[file];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require(file) as {
        default: typeof Module
      };
      if (module.default) {
        if (Object.getPrototypeOf(module.default) === Module) {
          const old = Array.from(this.modules).find(
            mod => module.default.name === mod.constructor.name
          );
          if (old) this.unregisterModule(old);
          this.registerModule(module.default);
          console.log(`Auto reloaded module in file ${file}`);
        } else {
          throw new TypeError(
            `Module ${file}"s default export is not of a Module.`
          );
        }
      } else {
        throw new Error(`Module ${file} doesn"t have a default export`);
      }
    });
  }

  loadModulesFromFolder(path: string): void {
    const files = readdirSync(path);
    files.forEach(file => {
      const fn = join(process.cwd(), path, file);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require(fn);
      if (module.default) {
        if (Object.getPrototypeOf(module.default) === Module) {
          this.registerModule(module.default);
        } else {
          throw new TypeError(
            `Module ${fn}"s default export is not of a Module.`
          );
        }
      } else {
        throw new Error(`Module ${fn} doesn"t have a default export`);
      }
    });
  }
}

interface ErisClientOptions {
  botAdmins: string[]
}