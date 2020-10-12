import { Module } from "../modules/Module";
import { ClientEvents } from "discord.js";

export interface IListenerDecoratorOptions {
  event: keyof ClientEvents
}
export interface IListenerDecoratorMeta {
  event: keyof ClientEvents,
  id: string,
  func: Function
}

export function listener(opts: IListenerDecoratorOptions) {
  return function (
    target: Module,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const targetConstructorName = target.constructor.name; // Making this a variable to avoid some weird TS bug.
    if (!(target instanceof Module))
      throw new TypeError(
        `${targetConstructorName} doesn't extend Module`
      );
    if (!(descriptor.value.constructor instanceof Function))
      throw new TypeError(
        `Decorator needs to be applied to a Method. (${targetConstructorName}#${descriptor.value.name} was ${descriptor.value.constructor.name})`
      );

    const listenersMeta: IListenerDecoratorMeta[] =
      Reflect.getMetadata("eris:listenerMetas", target) || [];

    listenersMeta.push({
      event: opts.event,
      id: propertyKey,
      func: Reflect.get(target, propertyKey)
    });

    Reflect.defineMetadata(
      "eris:listenerMetas",
      listenersMeta,
      target
    );
  };
}