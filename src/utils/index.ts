import { GuildMember } from "discord.js";
import { resolveRole, resolveUser, resolveChannel } from "./arguments/supportedArgs";
import { strings } from "./messages";

// export const roleParser = async (arg: string, msg: Message): Promise<string | Role> => {
//   const resRole = await resolveRole(arg, msg);
//   if (resRole) return resRole;

//   const results: Role[] = [];
//   const reg = new RegExp(regExpEsc(arg), "i");
//   for (const role of msg.guild.roles.cache.values())
//     if (reg.test(role.name)) results.push(role);

//   let querySearch: Role[];
//   if (results.length > 0) {
//     const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
//     const filtered = results.filter(role => regWord.test(role.name));
//     querySearch = filtered.length > 0 ? filtered : results;
//   } else {
//     querySearch = results;
//   }

//   if (querySearch.length === 0) return strings.modules.exclusions.roleNotResolved;
//   return querySearch[0];
// };

// export const userParser = async (arg: string, msg: Message): Promise<string | User> => {
//   const resUser = await resolveUser(arg, msg.guild);
//   if (resUser) return resUser;

//   const results: User[] = [];
//   const reg = new RegExp(regExpEsc(arg), "i");
//   for (const member of msg.guild.members.cache.values()) {
//     if (reg.test(member.user.username)) results.push(member.user);
//   }

//   let querySearch: User[];
//   if (results.length > 0) {
//     const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
//     const filtered = results.filter(user => regWord.test(user.username));
//     querySearch = filtered.length > 0 ? filtered : results;
//   } else {
//     querySearch = results;
//   }

//   if (querySearch.length === 0) return strings.modules.exclusions.userNotResolved;
//   return querySearch[0];
// };

// export const channelParser = async (arg: string, msg: Message, category = false): Promise<string | TextChannel> => {
//   const resChannel = await resolveChannel(arg, msg.guild);
//   if (resChannel) return resChannel;

//   const results: GuildChannel[] = [];
//   const reg = new RegExp(regExpEsc(arg), "i");
//   for (const channel of msg.guild.channels.cache.values()) {
//     if (reg.test(channel.name)) results.push(channel);
//   }

//   let querySearch;
//   if (results.length > 0) {
//     const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
//     let filtered = results.filter(channel => regWord.test(channel.name));
//     if (category) filtered = filtered.filter(channel => channel.type === "category"); else filtered = filtered.filter(channel => channel.type === "text");
//     querySearch = filtered.length > 0 ? filtered : results;
//   } else {
//     querySearch = results;
//   }

//   if (querySearch.length === 0) return category ? strings.arguments.couldNotFindCategory : strings.arguments.couldNotFindTextChannel;
//   return querySearch[0];
// };


export const codeblockMember = (added: GuildMember[], removed: GuildMember[]): string => [
  "```diff",
  ...added.map(r => `+ ${r.user.tag}`),
  ...removed.map(r => `- ${r.user.tag}`),
  "```"
].join("\n");