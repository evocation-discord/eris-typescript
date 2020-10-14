import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import { strings } from "@utils/messages";
import Discord from "discord.js";

export function guildChannel(arg: string, message: Discord.Message): Discord.GuildChannel {
  const resChannel = resolveGuildChannel(arg, message.guild);
  if (resChannel) return resChannel;

  const results: Discord.GuildChannel[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const channel of message.guild.channels.cache.values()) {
    if (reg.test(channel.name)) results.push(channel);
  }

  let querySearch: Discord.GuildChannel[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter((channel) => regWord.test(channel.name));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.parsers.couldNotFindGuildChannel);
  return querySearch[0];
}

export function resolveGuildChannel(query: string | Discord.Channel | Discord.Message, guild: Discord.Guild): Discord.GuildChannel {
  if (query instanceof Discord.Channel) return guild.channels.cache.has(query.id) ? query as Discord.GuildChannel : null;
  if (query instanceof Discord.Message) return query.guild.id === guild.id ? query.channel as Discord.GuildChannel : null;
  if (typeof query === "string" && regex.channel.test(query)) {
    return guild.channels.cache.get(regex.channel.exec(query)[1]) as Discord.GuildChannel;
  }
  return null;
}
