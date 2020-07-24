import { Message } from "discord.js";
import { Inhibitor } from "../inhibitors/Inhibitor";
import { Module } from "../modules/Module";
import { Context } from "../Context";

export interface ICommandDecoratorOptions {
  description?: string;
  aliases: string[];
  single: boolean;
  inhibitors: Inhibitor[];
  onError: (msg: Message, error: Error) => void;
}

interface ICommandArgument {
  type: Function;
  optional: boolean;
}

interface ICommandDecoratorMeta {
  id: string;
  args: ICommandArgument[];
  usesContextAPI: boolean;
}

type ICommandDecorator = ICommandDecoratorMeta & ICommandDecoratorOptions;

export function command(
  opts: Partial<ICommandDecoratorOptions> | undefined = {}
) {
  return function (
    target: Module,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const targetConstructorName = target.constructor.name;
    if (!(target instanceof Module))
      throw new TypeError(
        `${targetConstructorName} doesn't extend Module`
      );
    if (!(descriptor.value.constructor instanceof Function))
      throw new TypeError(
        `Decorator needs to be applied to a Method. (${targetConstructorName}#${descriptor.value.name} was ${descriptor.value.constructor.name})`
      );
    const types: Function[] = Reflect.getMetadata(
      "design:paramtypes",
      target,
      propertyKey
    );
    // Optional arg stuff
    const optionals: number[] =
      Reflect.getMetadata(
        "cookiecord:optionalCommandArgs",
        target,
        propertyKey
      ) || [];
    if (optionals.includes(0))
      throw new Error("The first argument may not be optional");
    let lastOpt: number = optionals[0] + 1;
    for (let x of optionals) {
      if (lastOpt - x !== 1)
        throw new Error("Only the last arguments can be optional");
      lastOpt = x;
    }
    const newMeta: ICommandDecorator = {
      aliases: opts.aliases || [],
      description: opts.description,
      id: propertyKey,
      args: types.slice(1).map((type, i) => ({
        type,
        optional: optionals.includes(i + 1)
      })),
      single: opts.single || false,
      inhibitors: opts.inhibitors || [],
      usesContextAPI: types[0] == Context,
      onError:
        opts.onError ||
        (msg => {
          msg.reply(":warning: error while executing command!");
        })
    };
    if (
      newMeta.single &&
      (newMeta.args.length !== 1 || newMeta.args[0].type !== String)
    ) {
      throw new Error(
        `${target.constructor.name}/${newMeta.id}: single arg commands can only take in one string`
      );
    }

    const targetMetas: ICommandDecorator[] =
      Reflect.getMetadata("cookiecord:commandMetas", target) || [];
    targetMetas.push(newMeta);
    Reflect.defineMetadata("cookiecord:commandMetas", targetMetas, target);
  };
}
export { ICommandDecorator, ICommandArgument };

export function optional(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  if (!(target instanceof Module))
    throw new TypeError(`${target.constructor.name} doesn't extend Module`);
  const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey);
  if (!(descriptor?.value.constructor instanceof Function))
    throw new TypeError(
      `Decorator needs to be applied to a Method. (${target.constructor.name}#${descriptor?.value.name} was ${descriptor?.value.constructor.name})`
    );

  const arr: number[] =
    Reflect.getMetadata(
      "cookiecord:optionalCommandArgs",
      target,
      propertyKey
    ) || [];
  arr.push(parameterIndex);

  Reflect.defineMetadata(
    "cookiecord:optionalCommandArgs",
    arr,
    target,
    propertyKey
  );
};