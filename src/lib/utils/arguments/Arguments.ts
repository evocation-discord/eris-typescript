import ArgTextProcessor from "./ArgumentProcessor";
import { supportedArgs, allParsers } from "./supportedArgs";
import * as discord from "discord.js";

export class Greedy {
  // Defines the type.
  private type: supportedArgs;

  // Constructs the class.
  constructor(type: supportedArgs) {
    this.type = type;
  }

  // Handle the parsing of this.
  async parse(parser: ArgTextProcessor, msg: discord.Message): Promise<unknown[]> {
    // Get the parser for the type.
    const typeParser = allParsers.get(this.type);

    // Call the parser.
    const x = await parser.greedy(typeParser, msg);
    if (x.length === 0) throw new Error("Greedy parsing expects at least one argument.");
    return x;
  }
}

// Handles remainder parsing.
export class Remainder {
  // Defines the type.
  private type: supportedArgs;

  // Constructs the class.
  constructor(type: supportedArgs) {
    this.type = type;
  }

  // Handle the parsing of this.
  async parse(parser: ArgTextProcessor, msg: discord.Message): Promise<unknown[]> {
    // Get the parser for the type.
    const typeParser = allParsers.get(this.type);

    // Get the remainder.
    const remainder = parser.remainder();
    if (remainder === "") {
      // Argument is blank.
      throw new Error("Remainder of the command is blank.");
    }

    // Call the parser.
    return [await typeParser(remainder, msg)];
  }
}

// Handle optional arguments.
export class Optional {
  // Defines the arg.
  private arg: supportedArgs | Greedy | Remainder;

  // Constructs the class.
  constructor(arg: supportedArgs | Greedy | Remainder) {
    this.arg = arg;
  }

  // Handles the parsing.
  async parse(parser: ArgTextProcessor, msg: discord.Message): Promise<unknown[]> {
    try {
      // Return all transformed arguments.
      return await getArgumentParser(this.arg)(parser, msg);
    } catch (_) {
      // Return a blank array.
      return [];
    }
  }
}


export const getArgumentParser = (arg: supportedArgs | Greedy | Remainder | Optional): ((parser: ArgTextProcessor, msg: discord.Message) => Promise<unknown[]>) => {
  // Return the parser.
  if (arg instanceof Greedy || arg instanceof Remainder || arg instanceof Optional) return async (parser: ArgTextProcessor, msg: discord.Message) => arg.parse.bind(arg)(parser, msg);

  // Get the parser for individual arguments.
  const transformer = allParsers.get(arg);

  // Handle the parsing.
  return async (parser: ArgTextProcessor, msg: discord.Message) => [await parser.one(transformer, msg)];
};