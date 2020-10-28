import { command, CommandCategories } from "@utils/commands";
import { Command } from "@utils/commands/Command";
import { emotes, env } from "@utils/constants";
import strings, { commandDescriptions } from "@utils/messages";
import { Module } from "@utils/modules";
import * as Arguments from "@utils/arguments";
import Discord from "discord.js";

const commandGroupsWithEmojis = {
  "Bot Maintainers": `${emotes.commandresponses.settings} **BOT MAINTAINERS**`,
  "Server Administrator": `${emotes.commandresponses.admin} **SERVER ADMINISTRATOR**`,
  Informational: `${emotes.commandresponses.information} **INFORMATIONAL**`,
  "Affiliation Management": `${emotes.commandresponses.affiliate} **AFFILIATION MANAGEMENT**`,
  Giveaways: `${emotes.giveaway.donation} **GIVEAWAYS**`,
  Moderation: `${emotes.commandresponses.moderation} **MODERATION**`,
  "Purchasable Role Limitation": `${emotes.commandresponses.creditcard} **PURCHASABLE ROLE LIMITATION**`,
  "Levelling System": `${emotes.commandresponses.experience} **LEVELLING SYSTEM**`,
  Soulstones: `${emotes.commandresponses.soulstones} **SOULSTONES** ${emotes.commandresponses.new}`,
  Endorphins: `${emotes.commandresponses.endorphin} **ENDORPHINS** ${emotes.commandresponses.beta}`
};

export default class HelpModule extends Module {
  @command({
    group: CommandCategories.Informational, args: [new Arguments.Optional(String)], usage: "[command:string]", description: commandDescriptions.help
  })
  async help(msg: Discord.Message, cmmand?: string): Promise<void> {
    const commands = [...this.client.commandManager.cmds];
    if (!cmmand) {
      const commandGroups: CommandCategories[] = [
        CommandCategories["Bot Maintainers"],
        CommandCategories["Server Administrator"],
        CommandCategories["Affiliation Management"],
        // CommandCategories["Temporary Role Assignment"],
        // CommandCategories["Starboard"],
        CommandCategories.Giveaways,
        CommandCategories.Moderation,
        CommandCategories.Endorphins,
        CommandCategories.Soulstones,
        // CommandCategories["Relics"],
        CommandCategories["Levelling System"],
        CommandCategories.Informational,
        CommandCategories["Purchasable Role Limitation"]
      ];
      const messageArray: string[] = [];

      for await (const commandGroup of commandGroups) {
        const cmds = await this.filterCommands(msg, commands.filter((c) => c.group === commandGroup));
        if (cmds.length > 0) messageArray.push(`${commandGroupsWithEmojis[commandGroup] || strings.modules.help.unknownCategory}\n${cmds.sort((a, b) => a.triggers[0].localeCompare(b.triggers[0])).map((cmd) => `\`${process.env.PREFIX}${cmd.triggers[0]}\``).join(", ")}\n`);
      }
      messageArray.push(strings.modules.help.specificCommandHelp);
      msg.channel.send(messageArray.join("\n"), { split: true });
    } else if (this.client.commandManager.getByTrigger(cmmand)) {
      const cmd = this.client.commandManager.getByTrigger(cmmand);
      if (cmd.admin) {
        if (!this.client.botMaintainers.includes(msg.author.id)) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.help.noPermission));
      } else if (cmd.staff) {
        if (!msg.member.roles.cache.some((role) => [env.ROLES.STAFF, env.ROLES.ADMINISTRATORS].includes(role.id))) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.help.noPermission));
      }
      const triggers = [...cmd.triggers];
      const cmdName = triggers.shift();
      const message = [
        `**COMMAND**: \`${process.env.PREFIX}${cmdName}\``,
        `**SYNTACTIC USAGE**: ${cmd.usage ? `\`${cmd.usage}\`` : strings.modules.help.noArgumentsNeeded}`,
        `**ALIASES**: ${triggers.map((trigger) => `\`${trigger}\``).length > 0 ? triggers.map((trigger) => `\`${trigger}\``).join(", ") : strings.modules.help.noAliases}`,
        `**DESCRIPTION**: ${cmd.description || strings.modules.help.noDescription}`
      ];
      msg.channel.send(message.join("\n"));
    } else {
      strings.errors.errorMessage(msg, strings.errors.error(strings.modules.help.noCommandFound));
    }
    return null;
  }

  async filterCommands(msg: Discord.Message, commands: Command[]): Promise<Command[]> {
    const cmds: Command[] = [];
    for await (const cmd of commands) {
      const inhibitors = cmd.inhibitors.filter((i) => i.name);
      let allow = true;
      for await (const inhibitor of inhibitors) {
        const reason = await inhibitor(msg, cmd);
        if (reason) allow = false;
      }
      if (allow) cmds.push(cmd);
    }
    return cmds;
  }
}
