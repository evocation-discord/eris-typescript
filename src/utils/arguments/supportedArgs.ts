import Discord from "discord.js";
import Duration from "./Duration";
import { strings } from "@utils/messages";
import { regExpEsc } from "@utils/constants/regex";

// All supported arguments.
export type supportedArgs = typeof Discord.GuildMember | typeof Discord.User | typeof Discord.Role | typeof Discord.Guild | typeof Discord.TextChannel | typeof String | typeof Number | typeof Duration;

// Defines all parsers.
export const allParsers: Map<supportedArgs, (arg: string, msg: Discord.Message) => Promise<unknown>> = new Map();

const USER_REGEXP = /^(?:<@!?)?(\d{17,19})>?$/;
const ROLE_REGEXP = /^(?:<@&)?(\d{17,19})>?$/;
const CHANNEL_REGEXP = /^(?:<#)?(\d{17,19})>?$/;

// Used to parse a number.
const numberParser = async (arg: string): Promise<number> => {
  if (isInt(arg)) return parseInt(arg);
  throw new Error(strings.general.error(strings.arguments.invalidNumber));
};
allParsers.set(Number, numberParser);

// Used to parse a duration.
const durationParser = async (arg: string): Promise<Duration> => {
  return new Duration(arg);
};
allParsers.set(Duration, durationParser);

// Used to parse a guild member.
export const guildMemberParser = async (arg: string, msg: Discord.Message): Promise<Discord.GuildMember> => {
  const resMember = await resolveMember(arg, msg.guild);
  if (resMember) return resMember;

  const results: Discord.GuildMember[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const member of msg.guild.members.cache.values()) {
    if (reg.test(member.user.username)) results.push(member);
  }

  let querySearch: Discord.GuildMember[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(member => regWord.test(member.user.username));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.general.error(strings.arguments.couldNotFindGuildMember));
  return querySearch[0];
};
allParsers.set(Discord.GuildMember, guildMemberParser);

// Used to parse a user.
const userParser = async (arg: string, msg: Discord.Message): Promise<Discord.User> => {
  const resUser = await resolveUser(arg, msg.guild);
  if (resUser) return resUser;

  const results: Discord.User[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const member of msg.guild.members.cache.values()) {
    if (reg.test(member.user.username)) results.push(member.user);
  }

  let querySearch: Discord.User[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(user => regWord.test(user.username));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.general.error(strings.arguments.couldNotFindUser));
  return querySearch[0];
};
allParsers.set(Discord.User, userParser);

// Used to parse a guild.
const guildParser = async (arg: string, msg: Discord.Message): Promise<Discord.Guild> => {
  try {
    const x = msg.client.guilds.cache.get(arg);
    if (!x) throw new Error();
    return x;
  } catch (_) {
    throw new Error(strings.general.error(strings.arguments.couldNotFindGuild));
  }
};
allParsers.set(Discord.Guild, guildParser);

const textChannelParser = async (arg: string, msg: Discord.Message): Promise<Discord.TextChannel> => {
  const resChannel = resolveChannel(arg, msg.guild);
  if (resChannel) return resChannel;

  const results = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const channel of msg.guild.channels.cache.values()) {
    if (reg.test(channel.name)) results.push(channel);
  }

  let querySearch;
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(channel => regWord.test(channel.name) && channel.type === "text");
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  switch (querySearch.length) {
  case 0: throw new Error(strings.general.error(strings.arguments.couldNotFindTextChannel));
  default: return querySearch[0];
  }
};
allParsers.set(Discord.TextChannel, textChannelParser);

export const roleParser = async (arg: string, msg: Discord.Message): Promise<Discord.Role> => {
  const resRole = await resolveRole(arg, msg);
  if (resRole) return resRole;

  const results: Discord.Role[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const role of msg.guild.roles.cache.values()) {
    if (reg.test(role.name)) results.push(role);
  }

  let querySearch: Discord.Role[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(role => regWord.test(role.name));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.general.error(strings.arguments.couldNotFindRole));
  return querySearch[0];
};
allParsers.set(Discord.Role, roleParser);

// Handle string parsing.
allParsers.set(String, async x => x);

export const resolveUser = async (query: string | Discord.User, guild: Discord.Guild): Promise<Discord.User> => {
  if (query instanceof Discord.User) return query;
  if (typeof query === "string") {
    if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)[1]);
    if (/\w{1,32}#\d{4}/.test(query)) {
      const res = guild.members.cache.find(member => member.user.tag === query);
      return res ? res.user : null;
    }
  }
  return null;
};

const resolveMember = async (query: string | Discord.GuildMember | Discord.User, guild: Discord.Guild): Promise<Discord.GuildMember> => {
  if (query instanceof Discord.GuildMember) return query;
  if (query instanceof Discord.User) return guild.members.fetch(query);
  if (typeof query === "string") {
    if (USER_REGEXP.test(query)) return guild.members.fetch(USER_REGEXP.exec(query)[1]);
    if (/\w{1,32}#\d{4}/.test(query)) {
      const res = guild.members.cache.find(member => member.user.tag === query);
      return res || null;
    }
  }
  return null;
};

export const resolveChannel = (query: string | Discord.Channel | Discord.Message, guild: Discord.Guild): Discord.TextChannel => {
  if (query instanceof Discord.Channel && query.type === "text") return guild.channels.cache.has(query.id) ? query as Discord.TextChannel : null;
  if (query instanceof Discord.Channel && query.type === "news") return guild.channels.cache.has(query.id) ? query as Discord.TextChannel : null;
  if (query instanceof Discord.Message) return query.guild.id === guild.id ? query.channel as Discord.TextChannel : null;
  if (typeof query === "string" && CHANNEL_REGEXP.test(query)) {
    const ch = guild.channels.cache.get(CHANNEL_REGEXP.exec(query)[1]) as Discord.TextChannel;
    if (ch.type === "text") return ch;
    if (ch.type === "news") return ch;
    return null;
  }
  return null;
};

export const resolveRole = async (query: string | Discord.Role, msg: Discord.Message): Promise<Discord.Role> => {
  if (query instanceof Discord.Role) return query;
  if (typeof query === "string" && ROLE_REGEXP.test(query)) return msg.guild.roles.resolve(ROLE_REGEXP.exec(query)[1]);
  return null;
};

const isInt = value => {
  if (isNaN(value)) {
    return false;
  }
  const x = parseFloat(value);
  return (x | 0) === x;
};