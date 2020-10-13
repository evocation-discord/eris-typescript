import { Module } from "@utils/modules";

export interface ICronDecoratorMeta {
  id: string,
  func: Function,
  cronTime: string | Date
}

export interface ICronDecoratorOptions {
  cronTime: string | Date
}

export function cron(opts: ICronDecoratorOptions) {
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

    const cronMeta: ICronDecoratorMeta[] =
      Reflect.getMetadata("eris:cronMetas", target) || [];

    cronMeta.push({
      id: propertyKey,
      func: Reflect.get(target, propertyKey),
      cronTime: opts.cronTime
    });

    Reflect.defineMetadata(
      "eris:cronMetas",
      cronMeta,
      target
    );
  };
}