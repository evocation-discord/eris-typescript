import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import { strings } from "@utils/messages";
import Discord from "discord.js";

export function role(arg: string, message: Discord.Message): Discord.Role {
  const resRole = resolveRole(arg, message);
  if (resRole) return resRole;

  const results: Discord.Role[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const r of message.guild.roles.cache.values()) {
    if (reg.test(r.name)) results.push(r);
  }

  let querySearch: Discord.Role[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter((r) => regWord.test(r.name));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) throw new Error(strings.parsers.couldNotFindRole);
  return querySearch[0];
}

export function resolveRole(query: string | Discord.Role, msg: Discord.Message): Discord.Role {
  if (query instanceof Discord.Role) return query;
  if (typeof query === "string" && regex.role.test(query)) return msg.guild.roles.resolve(regex.role.exec(query)[1]);
  return null;
}
