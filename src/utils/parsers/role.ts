import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import { strings } from "@utils/messages";
import Discord from "discord.js";

export async function role(arg: string, message: Discord.Message): Promise<Discord.Role> {
  const resRole = await resolveRole(arg, message);
  if (resRole) return resRole;

  const results: Discord.Role[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const role of message.guild.roles.cache.values()) {
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

  if (querySearch.length === 0) throw new Error(strings.parsers.couldNotFindRole);
  return querySearch[0];
}

export async function resolveRole(query: string | Discord.Role, msg: Discord.Message): Promise<Discord.Role> {
  if (query instanceof Discord.Role) return query;
  if (typeof query === "string" && regex.role.test(query)) return msg.guild.roles.resolve(regex.role.exec(query)[1]);
  return null;
}