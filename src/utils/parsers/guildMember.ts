import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import { strings } from "@utils/messages";
import Discord from "discord.js";

export async function guildMember(arg: string, message: Discord.Message): Promise<Discord.GuildMember> {
  const resMember = await resolveMember(arg, message.guild);
  if (resMember) return resMember;

  const results: Discord.GuildMember[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const member of message.guild.members.cache.values()) {
    if (reg.test(member.user.username)) results.push(member);
  }

  let querySearch: Discord.GuildMember[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter((member) => regWord.test(member.user.username));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.parsers.couldNotFindGuildMember);
  return querySearch[0];
}

export async function resolveMember(query: string | Discord.GuildMember | Discord.User, guild: Discord.Guild): Promise<Discord.GuildMember> {
  if (query instanceof Discord.GuildMember) return query;
  if (query instanceof Discord.User) return guild.members.fetch(query);
  if (typeof query === "string") {
    if (regex.user.test(query)) return guild.members.fetch(regex.user.exec(query)[1]);
    if (/\w{1,32}#\d{4}/.test(query)) {
      const res = guild.members.cache.find((member) => member.user.tag === query);
      return res || null;
    }
  }
  return null;
}
