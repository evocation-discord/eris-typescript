import { Client } from "discord.js";
import chokidar from "chokidar";
import { join } from "path";
import { readdirSync } from "fs";
import { CommandManager } from "../commands/CommandManager";
import { ListenerManager } from "../listener/ListenerManager";
import { Module } from "../modules/Module";
import { CommandParserModule } from "../commands/CommandParser";

export class ErisClient extends Client {
  public commandManager: CommandManager;
  public listenerManager: ListenerManager;
  public modules: Set<Module> = new Set();
  readonly botAdmins: string[];
  constructor(opts: Partial<ErisClientOptions> = {}) {
    super({});
    this.botAdmins = opts.botAdmins || [];
    this.commandManager = new CommandManager();
    this.listenerManager = new ListenerManager(this);
    this.registerModule(CommandParserModule);
  }

  registerModule(module: typeof Module | Module) {
    if (module == Module || module instanceof Module)
      throw new TypeError(
        "registerModule only takes in classes that extend Module"
      );
    if (
      Array.from(this.modules).some(
        m =>
          m.constructor.name == module.name ||
          m.constructor.name == module.constructor.name
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
    this.modules.add(mod);
    return this;
  }

  unregisterModule(mod: Module) {
    if (!this.modules.has(mod))
      throw new Error("Cannot unregister unregistered module");
    Array.from(this.listenerManager.listeners)
      .filter(l => l.module == mod)
      .forEach(l => this.listenerManager.remove(l));
    Array.from(this.commandManager.cmds)
      .filter(c => c.module == mod)
      .forEach(c => this.commandManager.remove(c));
    this.modules.delete(mod);
    return this;
  }
  reloadModulesFromFolder(path: string) {
    const fn = join(process.cwd(), path);
    const watcher = chokidar.watch(fn);

    watcher.on("change", file => {
      // Here be dragons.
      // Might need more validation here...
      delete require.cache[file];
      const module = require(file) as {
        default: typeof Module;
      };
      if (module.default) {
        if (Object.getPrototypeOf(module.default) == Module) {
          const old = Array.from(this.modules).find(
            mod => module.default.name == mod.constructor.name
          );
          if (old) this.unregisterModule(old);
          this.registerModule(module.default);
          console.log(`Auto reloaded module in file ${file}`);
        } else {
          throw new TypeError(
            `Module ${file}'s default export is not of a Module.`
          );
        }
      } else {
        throw new Error(`Module ${file} doesn't have a default export`);
      }
    });
  }

  loadModulesFromFolder(path: string) {
    const files = readdirSync(path);
    files.forEach(file => {
      const fn = join(process.cwd(), path, file);
      const module = require(fn);
      if (module.default) {
        if (Object.getPrototypeOf(module.default) == Module) {
          this.registerModule(module.default);
        } else {
          throw new TypeError(
            `Module ${fn}'s default export is not of a Module.`
          );
        }
      } else {
        throw new Error(`Module ${fn} doesn't have a default export`);
      }
    });
  }
}

interface ErisClientOptions {
  botAdmins: string[];
}