import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import { strings } from "@utils/messages";
import Discord from "discord.js";

export async function categoryChannel(arg: string, message: Discord.Message): Promise<Discord.CategoryChannel> {
  const resChannel = await resolveCategoryChannel(arg, message.guild);
  if (resChannel) return resChannel;

  const results: Discord.CategoryChannel[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const channel of message.guild.channels.cache.values()) {
    if (reg.test(channel.name)) results.push(channel as Discord.CategoryChannel);
  }

  let querySearch: Discord.CategoryChannel[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(channel => regWord.test(channel.name) && channel.type === "category");
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.parsers.couldNotFindCategory);
  return querySearch[0];
}

export async function resolveCategoryChannel(query: string | Discord.Channel | Discord.Message, guild: Discord.Guild): Promise<Discord.CategoryChannel> {
  if (query instanceof Discord.Channel && query.type === "category") return guild.channels.cache.has(query.id) ? query as Discord.CategoryChannel : null;
  if (query instanceof Discord.Message) return query.guild.id === guild.id ? (query.channel as Discord.TextChannel).parent : null;
  if (typeof query === "string" && regex.channel.test(query)) {
    const ch = guild.channels.cache.get(regex.channel.exec(query)[1]) as Discord.CategoryChannel;
    if (ch.type === "category") return ch;
    return null;
  }
  return null;
}