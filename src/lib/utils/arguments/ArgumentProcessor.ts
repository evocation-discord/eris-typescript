import * as discord from "discord.js";

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
    if (!a.startsWith('"')) return new ArgConstructor([a], a);

    // Ok, if not, we combine until the quote ends (if the string ends before a end quote, we just return all arguments).
    let argParts = [a];
    let argsCombined = a.substr(1);
    for (; ;) {
      // Shift the argument.
      let arg = this.unusedArgs.shift();

      // If this doesn't exist, return all the current arguments combined.
      if (!arg) return new ArgConstructor(argParts, argsCombined);

      // Push the argument as a part.
      argParts.push(arg);

      // Check if the string ends with a quote. If so, return the args combined with this string (and the quote removed).
      if (arg.endsWith('"')) return new ArgConstructor(argParts, `${argsCombined} ${arg.slice(0, -1)}`);

      // Add to the arguments if not.
      argsCombined += ` ${arg}`;
    }
  }

  // Handle greedy argument parsing.
  async greedy(parser: (arg: string, msg: discord.Message) => Promise<any>, msg: discord.Message): Promise<any[]> {
    const a: any[] = [];
    for (; ;) {
      const argString = this.getArgumentString();
      if (!argString) return a;
      try {
        // Get the item.
        const r = await parser(argString.result, msg);

        // Add it to the array.
        a.push(r);
      } catch (err) {
        // We should re-add the parts used to construct the argument into the beginning of the array.
        this.unusedArgs = argString.parts.concat(this.unusedArgs);

        // Return the parsed array.
        return a;
      }
    }
  }

  // Get one argument.
  async one(parser: (arg: string, msg: discord.Message) => Promise<any>, msg: discord.Message): Promise<any> {
    // Get the argument if we can.
    const x = this.getArgumentString();
    if (!x) throw new Error("No argument was supplied.");

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