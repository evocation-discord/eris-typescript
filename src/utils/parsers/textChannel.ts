import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import strings from "@utils/messages";
import Discord from "discord.js";

export function textChannel(arg: string, message: Discord.Message): Discord.TextChannel {
  const resChannel = resolveTextChannel(arg, message.guild);
  if (resChannel) return resChannel;

  const results: Discord.GuildChannel[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const channel of message.guild.channels.cache.values()) {
    if (reg.test(channel.name)) results.push(channel);
  }

  let querySearch: Discord.GuildChannel[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter((channel) => regWord.test(channel.name) && (channel.type === "text" || channel.type === "news"));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.errors.parsers.couldNotFindTextChannel);
  return querySearch[0] as Discord.TextChannel;
}

export function resolveTextChannel(query: string | Discord.Channel | Discord.Message, guild: Discord.Guild): Discord.TextChannel {
  if (query instanceof Discord.Channel && query.type === "text") return guild.channels.cache.has(query.id) ? query as Discord.TextChannel : null;
  if (query instanceof Discord.Channel && query.type === "news") return guild.channels.cache.has(query.id) ? query as Discord.TextChannel : null;
  if (query instanceof Discord.Message) return query.guild.id === guild.id ? query.channel as Discord.TextChannel : null;
  if (typeof query === "string" && regex.channel.test(query)) {
    const ch = guild.channels.cache.get(regex.channel.exec(query)[1]) as Discord.TextChannel;
    if (ch.type === "text") return ch;
    if (ch.type === "news") return ch;
    return null;
  }
  return null;
}
