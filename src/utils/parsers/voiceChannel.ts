import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import strings from "@utils/messages";
import Discord from "discord.js";

export function voiceChannel(arg: string, message: Discord.Message): Discord.VoiceChannel {
  const resChannel = resolveVoiceChannel(arg, message.guild);
  if (resChannel) return resChannel;

  const results: Discord.VoiceChannel[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const channel of message.guild.channels.cache.values()) {
    if (reg.test(channel.name)) results.push(channel as Discord.VoiceChannel);
  }

  let querySearch: Discord.VoiceChannel[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter((channel) => regWord.test(channel.name) && channel.type === "voice");
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.errors.parsers.couldNotFindVoiceChannel);
  return querySearch[0];
}

export function resolveVoiceChannel(query: string | Discord.Channel, guild: Discord.Guild): Discord.VoiceChannel {
  if (query instanceof Discord.Channel && query.type === "voice") return guild.channels.cache.has(query.id) ? query as Discord.VoiceChannel : null;
  if (typeof query === "string" && regex.channel.test(query)) {
    const ch = guild.channels.cache.get(regex.channel.exec(query)[1]) as Discord.VoiceChannel;
    if (ch.type === "voice") return ch;
    return null;
  }
  return null;
}
