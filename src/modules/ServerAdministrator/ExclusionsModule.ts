import { command, CommandCategories } from "@utils/commands";
import inhibitors from "@utils/inhibitors";
import { commandDescriptions, errorMessage, strings } from "@utils/messages";
import { Module } from "@utils/modules";
import * as Arguments from "@utils/arguments";
import Discord from "discord.js";
import { env } from "@utils/constants";
import { Blacklist } from "@database/models";
import Embed from "@utils/embed";
import { role as roleParser, user as userParser } from "@utils/parsers";

export default class ExclusionsModule extends Module {
  @command({
    inhibitors: [inhibitors.adminOnly], args: [new Arguments.Optional(String), new Arguments.Optional(new Arguments.Remainder(String))], group: CommandCategories["Server Administrator"], staff: true, description: commandDescriptions.exclude, usage: "[user|role] [ID/mention]"
  })
  async exclude(msg: Discord.Message, type?: "user" | "role", id?: string): Promise<void | Discord.Message> {
    if (msg.channel.type === "dm") return;
    if (!type || !id) return errorMessage(msg, strings.general.error(strings.general.commandSyntax("e!exclude [user|role] [ID/mention]")));
    if (type === "role") {
      if (!msg.member.roles.cache.has(env.ROLES.LEAD_ADMINISTRATORS)) return;
      const role = await roleParser(id, msg);
      if (typeof role === "string") return errorMessage(msg, strings.general.error(role));
      if (msg.member.roles.cache.has(role.id)) return errorMessage(msg, strings.general.error(strings.modules.exclusions.cantAddRoleToExclusions));
      await Blacklist.create({
        type: "role",
        id: role.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.exclusions.executedExclusions("role")));
    } else if (type === "user") {
      const user = await userParser(id, msg);
      if (typeof user === "string") return errorMessage(msg, strings.general.error(user));
      if (user.id === msg.author.id) return errorMessage(msg, strings.general.error(strings.modules.exclusions.cantExcludeYourself));
      if (user.bot) return errorMessage(msg, strings.general.error(strings.modules.exclusions.cantExcludeBots));
      await Blacklist.create({
        type: "user",
        id: user.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.exclusions.executedExclusions("user")));
    } else return errorMessage(msg, strings.general.error(strings.general.commandSyntax("e!exclude [user|role] [ID/mention]")));
  }

  @command({
    inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [new Arguments.Optional(String), new Arguments.Optional(String), new Arguments.Optional(new Arguments.Remainder(String))], staff: true, description: commandDescriptions.exclusions, usage: "[remove|clear] [user|role] [ID/mention]"
  })
  async exclusions(msg: Discord.Message, what?: "remove" | "clear", type?: "user" | "role", id?: string): Promise<Discord.Message|void> {
    if (!what) {
      const roleBlacklists = await Blacklist.find({ where: { type: "role" } });
      const userBlacklists = await Blacklist.find({ where: { type: "user" } });
      const embed = new Embed()
        .addField(strings.modules.exclusions.exclusionEmbedName("User"), userBlacklists.map((u) => strings.modules.exclusions.exclusionMapping(u)).join("\n") || strings.modules.exclusions.noUsersExcluded)
        .addField(strings.modules.exclusions.exclusionEmbedName("Role"), roleBlacklists.map((r) => strings.modules.exclusions.exclusionMapping(r)).join("\n") || strings.modules.exclusions.noRolesExcluded);
      return msg.channel.send(embed);
    }
    if (!["remove", "clear"].includes(what)) return errorMessage(msg, strings.general.error(strings.general.commandSyntax("e!exclusions [remove|clear] [user|role] [ID/mention]")));

    if (what === "remove") {
      if (!type || !["user", "role"].includes(type) || !id) return errorMessage(msg, strings.general.error(strings.general.commandSyntax("e!exclusions [remove|clear] [user|role] [ID/mention]")));
      if (type === "role") {
        const blacklist = await Blacklist.findOne({ where: { id, type: "role" } });
        if (!blacklist) return errorMessage(msg, strings.general.error(strings.modules.exclusions.roleNotExcluded));
        blacklist.remove();
        msg.channel.send(strings.general.success(strings.modules.exclusions.updatedExclusionsForRole));
      } else if (type === "user") {
        const blacklist = await Blacklist.findOne({ where: { id, type: "user" } });
        if (!blacklist) return errorMessage(msg, strings.general.error(strings.modules.exclusions.userNotExcluded));
        blacklist.remove();
        msg.channel.send(strings.general.success(strings.modules.exclusions.updatedExclusionsForUser));
      }
    } else if (what === "clear") {
      const blacklists = await Blacklist.find();
      blacklists.forEach((b) => b.remove());
      msg.channel.send(strings.general.success(strings.modules.exclusions.removedAllExclusions));
    }
  }
}
