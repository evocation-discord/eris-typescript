import { command, CommandCategories } from "@utils/commands";
import inhibitors from "@utils/inhibitors";
import strings, { commandDescriptions } from "@utils/messages";
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
    if (!type || !id) return strings.errors.errorMessage(msg, strings.errors.error(strings.errors.commandSyntax("e!exclude [user|role] [ID/mention]")));
    if (type === "role") {
      if (!msg.member.roles.cache.has(env.ROLES.LEAD_ADMINISTRATORS)) return;
      const role = await roleParser(id, msg);
      if (typeof role === "string") return strings.errors.errorMessage(msg, strings.errors.error(role));
      if (msg.member.roles.cache.has(role.id)) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.exclusions.cantAddRoleToExclusions));
      await Blacklist.create({
        type: "role",
        id: role.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.moderation.exclusions.executedExclusions("role")));
    } else if (type === "user") {
      const user = await userParser(id, msg);
      if (typeof user === "string") return strings.errors.errorMessage(msg, strings.errors.error(user));
      if (user.id === msg.author.id) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.exclusions.cantExcludeYourself));
      if (user.bot) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.exclusions.cantExcludeBots));
      await Blacklist.create({
        type: "user",
        id: user.id
      }).save();
      msg.channel.send(strings.general.success(strings.modules.moderation.exclusions.executedExclusions("user")));
    } else return strings.errors.errorMessage(msg, strings.errors.error(strings.errors.commandSyntax("e!exclude [user|role] [ID/mention]")));
  }

  @command({
    inhibitors: [inhibitors.adminOnly], group: CommandCategories["Server Administrator"], args: [new Arguments.Optional(String), new Arguments.Optional(String), new Arguments.Optional(new Arguments.Remainder(String))], staff: true, description: commandDescriptions.exclusions, usage: "[remove|clear] [user|role] [ID/mention]"
  })
  async exclusions(msg: Discord.Message, what?: "remove" | "clear", type?: "user" | "role", id?: string): Promise<Discord.Message|void> {
    if (!what) {
      const roleBlacklists = await Blacklist.find({ where: { type: "role" } });
      const userBlacklists = await Blacklist.find({ where: { type: "user" } });
      const embed = new Embed()
        .addField(strings.modules.moderation.exclusions.exclusionEmbedName("User"), userBlacklists.map((u) => strings.modules.moderation.exclusions.exclusionMapping(u)).join("\n") || strings.modules.moderation.exclusions.noUsersExcluded)
        .addField(strings.modules.moderation.exclusions.exclusionEmbedName("Role"), roleBlacklists.map((r) => strings.modules.moderation.exclusions.exclusionMapping(r)).join("\n") || strings.modules.moderation.exclusions.noRolesExcluded);
      return msg.channel.send(embed);
    }
    if (!["remove", "clear"].includes(what)) return strings.errors.errorMessage(msg, strings.errors.error(strings.errors.commandSyntax("e!exclusions [remove|clear] [user|role] [ID/mention]")));

    if (what === "remove") {
      if (!type || !["user", "role"].includes(type) || !id) return strings.errors.errorMessage(msg, strings.errors.error(strings.errors.commandSyntax("e!exclusions [remove|clear] [user|role] [ID/mention]")));
      if (type === "role") {
        const blacklist = await Blacklist.findOne({ where: { id, type: "role" } });
        if (!blacklist) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.exclusions.roleNotExcluded));
        blacklist.remove();
        msg.channel.send(strings.general.success(strings.modules.moderation.exclusions.updatedExclusionsForRole));
      } else if (type === "user") {
        const blacklist = await Blacklist.findOne({ where: { id, type: "user" } });
        if (!blacklist) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.exclusions.userNotExcluded));
        blacklist.remove();
        msg.channel.send(strings.general.success(strings.modules.moderation.exclusions.updatedExclusionsForUser));
      }
    } else if (what === "clear") {
      const blacklists = await Blacklist.find();
      blacklists.forEach((b) => b.remove());
      msg.channel.send(strings.general.success(strings.modules.moderation.exclusions.removedAllExclusions));
    }
  }
}
