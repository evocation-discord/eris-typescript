import { Message } from "discord.js";
import { Inhibitor } from "../inhibitors/Inhibitor";
import { Module } from "../modules/Module";
import { Remainder, Greedy, Optional } from "../arguments/Arguments";
import { supportedArgs } from "../arguments/supportedArgs";

export interface ICommandDecoratorOptions {
  description?: string,
  aliases: string[],
  inhibitors: Inhibitor[],
  group: string,
  onError: (msg: Message, error: Error) => void,
  args: (supportedArgs | Greedy | Remainder | Optional)[]
}

interface ICommandDecoratorMeta {
  id: string
}

export type ICommandDecorator = ICommandDecoratorMeta & ICommandDecoratorOptions;

export function command(
  opts: Partial<ICommandDecoratorOptions> | undefined = {}
) {
  return function (
    target: Module,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const targetConstructorName = target.constructor.name;
    if (!(target instanceof Module))
      throw new TypeError(
        `${targetConstructorName} doesn't extend Module`
      );
    if (!(descriptor.value.constructor instanceof Function))
      throw new TypeError(
        `Decorator needs to be applied to a Method. (${targetConstructorName}#${descriptor.value.name} was ${descriptor.value.constructor.name})`
      );
    const newMeta: ICommandDecorator = {
      aliases: opts.aliases || [],
      description: opts.description,
      id: propertyKey,
      group: opts.group || "General",
      args: opts.args,
      inhibitors: opts.inhibitors || [],
      onError:
        opts.onError ||
        (msg => {
          msg.reply(":warning: error while executing command!");
        })
    };

    const targetMetas: ICommandDecorator[] =
      Reflect.getMetadata("eris:commandMetas", target) || [];
    targetMetas.push(newMeta);
    Reflect.defineMetadata("eris:commandMetas", targetMetas, target);
  };
}