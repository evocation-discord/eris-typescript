import { Module } from "../modules/Module";

export interface IMonitorDecoratorMeta {
  id: string,
  func: Function
}

export function monitor() {
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

    const monitorsMeta: IMonitorDecoratorMeta[] =
      Reflect.getMetadata("cookiecord:monitorMetas", target) || [];

    monitorsMeta.push({
      id: propertyKey,
      func: Reflect.get(target, propertyKey)
    });

    Reflect.defineMetadata(
      "cookiecord:monitorMetas",
      monitorsMeta,
      target
    );
  };
}