import * as Arguments from "@utils/arguments";
import { supportedArgs } from "@utils/arguments/supportedArgs";
import { Inhibitor } from "@utils/inhibitors";
import { Module } from "@utils/modules";
import { CommandCategories } from ".";

export interface ICommandDecoratorOptions {
  description?: string,
  usage?: string,
  aliases: string[],
  inhibitors: Inhibitor[],
  group: CommandCategories,
  staff?: boolean,
  admin?: boolean,
  args: (supportedArgs | Arguments.Remainder | Arguments.Optional)[]
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
      staff: opts.staff || false,
      admin: opts.admin || false,
      aliases: opts.aliases || [],
      description: opts.description,
      id: propertyKey,
      group: opts.group || CommandCategories.Informational,
      args: opts.args,
      usage: opts.usage,
      inhibitors: opts.inhibitors || []
    };

    const targetMetas: ICommandDecorator[] =
      Reflect.getMetadata("eris:commandMetas", target) || [];
    targetMetas.push(newMeta);
    Reflect.defineMetadata("eris:commandMetas", targetMetas, target);
  };
}
