import * as discord from "discord.js";

// All supported arguments.
export type supportedArgs = typeof discord.GuildMember | typeof discord.User | typeof discord.Guild | typeof String | typeof Number;

// Defines all parsers.
export const allParsers: Map<supportedArgs, (arg: string, msg: discord.Message) => Promise<any>> = new Map();

// Used to parse a number.
const numberParser = async (arg: string): Promise<Number> => {
  const n = Number(arg);
  if (typeof n === "number") return n;
  throw new Error("The argument must be a valid number.");
};
allParsers.set(Number, numberParser);

// Trims all ID related waffle.
const trimIdWaffle = (arg: string): string => {
  if (arg.startsWith("<@") && arg.endsWith(">")) {
    arg = arg.slice(2, -1);
    if (arg.startsWith("!")) arg = arg.slice(1);
  }
  return arg;
};

// Used to parse a guild member.
const guildMemberParser = async (arg: string, msg: discord.Message): Promise<discord.GuildMember> => {
  const possibleMention = trimIdWaffle(arg);
  try {
    const x = await msg.guild?.members.fetch(possibleMention);
    if (!x) throw new Error();
    return x;
  } catch (_) {
    throw new Error("Could not find the member.");
  }
};
allParsers.set(discord.GuildMember, guildMemberParser);

// Used to parse a user.
const userParser = async (arg: string, msg: discord.Message): Promise<discord.User> => {
  const possibleMention = trimIdWaffle(arg);
  try {
    const x = await msg.client.users.fetch(possibleMention);
    if (!x) throw new Error();
    return x;
  } catch (_) {
    throw new Error("Could not find the user.");
  }
};
allParsers.set(discord.User, userParser);

// Used to parse a guild.
const guildParser = async (arg: string, msg: discord.Message): Promise<discord.Guild> => {
  try {
    const x = msg.client.guilds.cache.get(arg);
    if (!x) throw new Error();
    return x;
  } catch (_) {
    throw new Error("Could not find the guild.");
  }
};
allParsers.set(discord.Guild, guildParser);

// Handle string parsing.
allParsers.set(String, async x => x);