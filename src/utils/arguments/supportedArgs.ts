import Discord from "discord.js";
import Duration from "./Duration";
import { strings } from "@utils/messages";
import { guild, guildMember, role, textChannel, user } from "@utils/parsers";

// All supported arguments.
export type supportedArgs = typeof Discord.GuildMember | typeof Discord.User | typeof Discord.Role | typeof Discord.Guild | typeof Discord.TextChannel | typeof String | typeof Number | typeof Duration;

// Defines all parsers.
export const allParsers: Map<supportedArgs, (arg: string, msg: Discord.Message) => Promise<unknown>> = new Map();

// Used to parse a number.
const numberParser = async (arg: string): Promise<number> => {
  if (isInt(arg)) return parseInt(arg);
  throw new Error(strings.arguments.invalidNumber);
};
allParsers.set(Number, numberParser);

// Used to parse a duration.
const durationParser = async (arg: string): Promise<Duration> => new Duration(arg);
allParsers.set(Duration, durationParser);

// Used to parse a guild member.
const guildMemberParser = async (arg: string, msg: Discord.Message): Promise<Discord.GuildMember> => guildMember(arg, msg);
allParsers.set(Discord.GuildMember, guildMemberParser);

// Used to parse a user.
const userParser = async (arg: string, msg: Discord.Message): Promise<Discord.User> => user(arg, msg);
allParsers.set(Discord.User, userParser);

// Used to parse a guild.
const guildParser = async (arg: string, msg: Discord.Message): Promise<Discord.Guild> => guild(arg, msg);
allParsers.set(Discord.Guild, guildParser);

const textChannelParser = async (arg: string, msg: Discord.Message): Promise<Discord.TextChannel> => textChannel(arg, msg);
allParsers.set(Discord.TextChannel, textChannelParser);

const roleParser = async (arg: string, msg: Discord.Message): Promise<Discord.Role> => role(arg, msg);
allParsers.set(Discord.Role, roleParser);

// Handle string parsing.
allParsers.set(String, async x => x);

const isInt = value => {
  if (isNaN(value)) {
    return false;
  }
  const x = parseFloat(value);
  return (x | 0) === x;
};