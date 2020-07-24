import "reflect-metadata";
import { ErisClient } from "../client/ErisClient";
import { IListenerDecoratorMeta } from "../listener/decorator";
import { Listener } from "../listener/Listener";
import { ICommandDecorator } from "../commands/decorator";
import { Command } from "../commands/Command";
import { getArgTypes } from "../argTypeProvider";

export class Module {
  public client: ErisClient;
  constructor(client: ErisClient) {
    this.client = client;
  }
  processListeners() {
    const listenersMeta: IListenerDecoratorMeta[] =
      Reflect.getMetadata("cookiecord:listenerMetas", this) || [];

    return listenersMeta.map(
      meta =>
        ({
          event: meta.event,
          id: this.constructor.name + "/" + meta.id,
          module: this,
          func: meta.func
        } as Listener)
    );
  }
  processCommands() {
    const targetMetas: ICommandDecorator[] =
      Reflect.getMetadata("cookiecord:commandMetas", this) || [];
    const cmds = targetMetas.map(
      meta =>
        ({
          description: meta.description,
          func: Reflect.get(this, meta.id),
          id: this.constructor.name + "/" + meta.id,
          args: meta.args,
          triggers: [meta.id, ...meta.aliases].map(id =>
            id.toLowerCase()
          ),
          module: this,
          single: meta.single,
          inhibitors: meta.inhibitors,
          onError: meta.onError,
          usesContextAPI: meta.usesContextAPI
        } as Command)
    );
    cmds.forEach(cmd =>
      cmd.args.forEach(arg => {
        if (!getArgTypes(this.client)[arg.type.name])
          throw new Error(
            `command tried to use an unsupported argument type ${arg.type.name}`
          );
      })
    );
    return cmds;
  }
}