import ArgTextProcessor from "./ArgumentProcessor";
import { supportedArgs, allParsers } from "./supportedArgs";
import * as discord from "discord.js";
import { strings } from "../messages";

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
      throw new Error(strings.general.error(strings.arguments.remainderBlank));
    }

    // Call the parser.
    return [await typeParser(remainder, msg)];
  }
}

// Handle optional arguments.
export class Optional {
  // Defines the arg.
  private arg: supportedArgs | Remainder;

  // Constructs the class.
  constructor(arg: supportedArgs | Remainder) {
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


export const getArgumentParser = (arg: supportedArgs | Remainder | Optional): ((parser: ArgTextProcessor, msg: discord.Message) => Promise<unknown[]>) => {
  // Return the parser.
  if (arg instanceof Remainder || arg instanceof Optional) return async (parser: ArgTextProcessor, msg: discord.Message) => arg.parse.bind(arg)(parser, msg);

  // Get the parser for individual arguments.
  const transformer = allParsers.get(arg);

  // Handle the parsing.
  return async (parser: ArgTextProcessor, msg: discord.Message) => [await parser.one(transformer, msg)];
};