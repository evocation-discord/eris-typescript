import { command, Module, ErisClient, Optional, regExpEsc, resolveUser, resolveRole, emotes, Remainder, ROLES, Embed, inhibitors, CommandCategories, commandDescriptions, strings } from "@lib/utils";
import { Message, Role, User } from "discord.js";
import { Blacklist } from "@database/models";

export default class ExclusionsModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @command({ inhibitors: [inhibitors.adminOnly], args: [new Optional(String), new Optional(new Remainder(String))], group: CommandCategories["Server Administrator"], staff: true, description: commandDescriptions.exclude, usage: "[user|role] [ID/mention]" })
  async exclude(msg: Message, type?: "user" | "role", id?: string): Promise<void | Message> {
    if (msg.channel.type === "dm") return;
    if (!type || !id) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!exclude [user|role] [ID/mention]")));
    if (type === "role") {
      if (!msg.member.roles.cache.has(ROLES.LEAD_ADMINISTRATORS)) return;
      const role = await roleParser(id, msg);
      if (typeof role === "string") return msg.channel.send(strings.general.error(role));
      if (msg.member.roles.cache.has(role.id)) return msg.channel.send(strings.general.error(strings.modules.exclusions.cantAddRoleToExclusions));
      await Blacklist.create({
        type: "role",
        id: role.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.exclusions.executedExclusions("role")));
    } else if (type === "user") {
      const user = await userParser(id, msg);
      if (typeof user === "string") return msg.channel.send(strings.general.error(user));
      if (user.id === msg.author.id) return msg.channel.send(strings.general.error(strings.modules.exclusions.cantExcludeYourself));
      await Blacklist.create({
        type: "user",
        id: user.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.exclusions.executedExclusions("user")));
    } else return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!exclude [user|role] [ID/mention]")));
  }
  @command({ inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [new Optional(String), new Optional(String), new Optional(new Remainder(String))], staff: true, description: commandDescriptions.exclusions, usage: "[remove|clear] [user|role] [ID/mention]" })
  async exclusions(msg: Message, what?: "remove" | "clear", type?: "user" | "role", id?: string): Promise<Message> {
    if (!what) {
      const roleBlacklists = await Blacklist.find({ where: { type: "role" } });
      const userBlacklists = await Blacklist.find({ where: { type: "user" } });
      const embed = Embed
        .addField(strings.modules.exclusions.exclusionEmbedName("User"), userBlacklists.map(u => strings.modules.exclusions.exclusionMapping(u)).join("\n") || strings.modules.exclusions.noUsersExcluded)
        .addField(strings.modules.exclusions.exclusionEmbedName("Role"), roleBlacklists.map(r => strings.modules.exclusions.exclusionMapping(r)).join("\n") || strings.modules.exclusions.noRolesExcluded);
      return msg.channel.send(embed);
    }
    if (!["remove", "clear"].includes(what)) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!exclusions [remove|clear] [user|role] [ID/mention]")));

    if (what === "remove") {
      if (!type || !["user", "role"].includes(type) || !id) return msg.channel.send(strings.general.error(strings.general.commandSyntax("e!exclusions [remove|clear] [user|role] [ID/mention]")));
      if (type === "role") {
        const blacklist = await Blacklist.findOne({ where: { id: id, type: "role" } });
        if (!blacklist) return msg.channel.send(strings.general.error(strings.modules.exclusions.roleNotExcluded));
        blacklist.remove();
        msg.channel.send(strings.general.success(strings.modules.exclusions.updatedExclusionsForRole));
      } else if (type === "user") {
        const blacklist = await Blacklist.findOne({ where: { id: id, type: "user" } });
        if (!blacklist) return msg.channel.send(strings.general.error(strings.modules.exclusions.userNotExcluded));
        blacklist.remove();
        msg.channel.send(strings.general.success(strings.modules.exclusions.updatedExclusionsForUser));
      }
    } else if (what === "clear") {
      const blacklists = await Blacklist.find();
      blacklists.forEach(b => b.remove());
      msg.channel.send(strings.general.success(strings.modules.exclusions.removedAllExclusions));
    }
  }
}

const roleParser = async (arg: string, msg: Message) => {
  const resRole = await resolveRole(arg, msg);
  if (resRole) return resRole;

  const results: Role[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const role of msg.guild.roles.cache.values())
    if (reg.test(role.name)) results.push(role);

  let querySearch: Role[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(role => regWord.test(role.name));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) return strings.modules.exclusions.roleNotResolved;
  return querySearch[0];
};

const userParser = async (arg: string, msg: Message) => {
  const resUser = await resolveUser(arg, msg.guild);
  if (resUser) return resUser;

  const results: User[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const member of msg.guild.members.cache.values()) {
    if (reg.test(member.user.username)) results.push(member.user);
  }

  let querySearch: User[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(user => regWord.test(user.username));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) return strings.modules.exclusions.userNotResolved;
  return querySearch[0];
};