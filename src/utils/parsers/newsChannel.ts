import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import strings from "@utils/messages";
import Discord from "discord.js";

export function newsChannel(arg: string, message: Discord.Message): Discord.NewsChannel {
  const resChannel = resolveNewsChannel(arg, message.guild);
  if (resChannel) return resChannel;

  const results: Discord.NewsChannel[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const channel of message.guild.channels.cache.values()) {
    if (reg.test(channel.name)) results.push(channel as Discord.NewsChannel);
  }

  let querySearch: Discord.NewsChannel[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter((channel) => regWord.test(channel.name) && (channel.type === "news"));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.errors.parsers.couldNotFindNewsChannel);
  return querySearch[0];
}

export function resolveNewsChannel(query: string | Discord.Channel | Discord.Message, guild: Discord.Guild): Discord.NewsChannel {
  if (query instanceof Discord.Channel && query.type === "news") return guild.channels.cache.has(query.id) ? query as Discord.NewsChannel : null;
  if (query instanceof Discord.Message) return query.guild.id === guild.id ? query.channel as Discord.NewsChannel : null;
  if (typeof query === "string" && regex.channel.test(query)) {
    const ch = guild.channels.cache.get(regex.channel.exec(query)[1]) as Discord.NewsChannel;
    if (ch.type === "news") return ch;
    return null;
  }
  return null;
}
