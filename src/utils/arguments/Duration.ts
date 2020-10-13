import { strings } from "../messages";

export default class Duration {
  duration: number;

  constructor(arg: string | number) {
    if (typeof arg === "number") this.duration = arg;
    else this.duration = this.parseDuration(arg);
  }

  private parseDuration(arg: string): number {
    const fragments = arg.match(/[1-9][0-9]*[mhsd]/g);
    let t = 0;
    const multiplier = {
      m: 60000,
      s: 1000,
      h: 3600000,
      d: 86400000,
    } as {[key: string]: number};
    for (const fragment of fragments) {
      const char = fragment[fragment.length - 1];
      const num = Number(fragment.slice(0, -1));
      if (isNaN(num)) throw new Error(strings.arguments.invalidDuration);
      t += multiplier[char] * num;
    }
    if (t === 0) throw new Error(strings.arguments.invalidDuration);
    return t;
  }

  toJSON(): {} {
    return {};
  }

  toString(): string|number {
    return this.duration;
  }
}