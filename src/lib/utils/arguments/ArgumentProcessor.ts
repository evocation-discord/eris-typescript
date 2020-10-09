import * as discord from "discord.js";
import { P } from "..";
import { strings } from "../messages";

class ArgConstructor {
  parts: string[];
  result: string;

  constructor(parts: string[], result: string) {
    this.parts = parts;
    this.result = result;
  }
}

export default class ArgTextProcessor {
  // Get the unused arguments.
  private unusedArgs: string[];

  // Construct the class.
  constructor(msgSpaceSplit: string[]) {
    this.unusedArgs = msgSpaceSplit;
  }

  // Get the remainder of the arguments.
  remainder(): string {
    const x = this.unusedArgs.join(" ");
    this.unusedArgs = [];
    return x;
  }

  // Used to get an argument as a string (or null if none is found) with the array of the things that were used to get it.
  private getArgumentString(): ArgConstructor | null {
    // Shift the first space split argument and return null if it is not set.
    const a = this.unusedArgs.shift();
    if (!a) return null;

    // If this doesn't start with a quote, we just return this argument.
    if (!a.startsWith("\"")) return new ArgConstructor([a], a);

    // Ok, if not, we combine until the quote ends (if the string ends before a end quote, we just return all arguments).
    const argParts = [a];
    let argsCombined = a.substr(1);
    for (; ;) {
      // Shift the argument.
      const arg = this.unusedArgs.shift();

      // If this doesn't exist, return all the current arguments combined.
      if (!arg) return new ArgConstructor(argParts, argsCombined);

      // Push the argument as a part.
      argParts.push(arg);

      // Check if the string ends with a quote. If so, return the args combined with this string (and the quote removed).
      if (arg.endsWith("\"")) return new ArgConstructor(argParts, `${argsCombined} ${arg.slice(0, -1)}`);

      // Add to the arguments if not.
      argsCombined += ` ${arg}`;
    }
  }

  // Get one argument.
  async one(parser: (arg: string, msg: discord.Message) => P<unknown>, msg: discord.Message): P<unknown> {
    // Get the argument if we can.
    const x = this.getArgumentString();
    if (!x) throw new Error(strings.general.error(strings.arguments.noArgumentSupplied));

    try {
      // Attempt to parse this argument.
      const item = await parser(x.result, msg);

      // Return the item.
      return item;
    } catch (err) {
      // We should re-add the parts used to construct the argument into the beginning of the array.
      this.unusedArgs = x.parts.concat(this.unusedArgs);

      // Re-throw the error.
      throw err;
    }
  }
}