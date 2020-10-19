import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import { strings } from "@utils/messages";
import Discord from "discord.js";

export async function user(arg: string, message: Discord.Message): Promise<Discord.User> {
  const resUser = await resolveUser(arg, message.guild);
  if (resUser) return resUser;

  const results: Discord.User[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const member of message.guild.members.cache.values()) {
    if (reg.test(member.user.username)) results.push(member.user);
  }

  let querySearch: Discord.User[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter((u) => regWord.test(u.username));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.parsers.couldNotFindUser);
  return querySearch[0];
}

export async function resolveUser(query: string | Discord.User, guild: Discord.Guild): Promise<Discord.User> {
  if (query instanceof Discord.User) return query;
  if (typeof query === "string") {
    if (regex.user.test(query)) return guild.client.users.fetch(regex.user.exec(query)[1]);
    if (/\w{1,32}#\d{4}/.test(query)) {
      const res = guild.members.cache.find((member) => member.user.tag === query);
      return res ? res.user : null;
    }
  }
  return null;
}
