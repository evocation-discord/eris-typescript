import { Message } from "discord.js";
import { command, Module, Optional, Command, ROLES, CommandCategories, commandDescriptions, strings, emotes, errorMessage, PV } from "@lib/utils";

const commandGroupsWithEmojis = {
  "Bot Owner": `${emotes.commandresponses.settings} **BOT OWNER**`,
  "Server Administrator": `${emotes.commandresponses.admin} **SERVER ADMINISTRATOR**`,
  "Informational": `${emotes.commandresponses.information} **INFORMATIONAL**`,
  "Affiliation Management": `${emotes.commandresponses.affiliate} **AFFILIATION MANAGEMENT**`,
  "Giveaways": `${emotes.giveaway.donation} **GIVEAWAYS**`,
  "Moderation": `${emotes.commandresponses.moderation} **MODERATION**`,
  "Purchasable Role Limitation": `${emotes.commandresponses.creditcard} **PURCHASABLE ROLE LIMITATION**`,
  "Levelling System": `${emotes.commandresponses.experience} **LEVELLING SYSTEM**`,
  "Currency (Soulstones)": `${emotes.commandresponses.soulstones} **CURRENCY (SOULSTONES)**`,
};

export default class HelpModule extends Module {

  @command({ group: CommandCategories.Informational, args: [new Optional(String)], usage: "[command:string]", description: commandDescriptions.help })
  async help(msg: Message, command?: string): PV<Message> {
    const commands = Array.from(this.client.commandManager.cmds);
    if (!command) {
      const commandGroups: CommandCategories[] = [
        CommandCategories["Bot Owner"],
        CommandCategories["Server Administrator"],
        CommandCategories["Affiliation Management"],
        // CommandCategories["Temporary Role Assignment"],
        // CommandCategories["Starboard"],
        CommandCategories["Giveaways"],
        CommandCategories["Moderation"],
        // CommandCategories["Currency (Endorphins)"],
        CommandCategories["Currency (Soulstones)"],
        // CommandCategories["Relics"],
        CommandCategories["Levelling System"],
        CommandCategories["Informational"],
        CommandCategories["Purchasable Role Limitation"]
      ];
      const messageArray: string[] = [];

      for await (const commandGroup of commandGroups) {
        const cmds = this.filterStaffCommands(msg, this.filterAdminCommands(msg, commands.filter(cmd => cmd.group === commandGroup)));
        if (cmds.length === 0) continue;
        messageArray.push(`${commandGroupsWithEmojis[commandGroup] || strings.modules.help.unknownCategory}\n${cmds.sort((a, b) => a.triggers[0].localeCompare(b.triggers[0])).map(cmd => `\`${process.env.PREFIX}${cmd.triggers[0]}\``).join(", ")}\n`);
      }
      messageArray.push(strings.modules.help.specificCommandHelp);
      msg.channel.send(messageArray.join("\n"), { split: true });
    } else if (this.client.commandManager.getByTrigger(command)) {
      const cmd = this.client.commandManager.getByTrigger(command);
      if (cmd.admin) {
        if (!this.client.botAdmins.includes(msg.author.id)) return errorMessage(msg, strings.general.error(strings.modules.help.noPermission));
      } else {
        if (cmd.staff) {
          if (!msg.member.roles.cache.some(role => [ROLES.STAFF, ROLES.ADMINISTRATORS].includes(role.id))) return errorMessage(msg, strings.general.error(strings.modules.help.noPermission));
        }
      }
      const triggers = [...cmd.triggers];
      const cmdName = triggers.shift();
      const message = [
        `**COMMAND**: \`${process.env.PREFIX}${cmdName}\``,
        `**SYNTACTIC USAGE**: ${cmd.usage ? `\`${cmd.usage}\`` : strings.modules.help.noArgumentsNeeded }`  ,
        `**ALIASES**: ${triggers.map(trigger => `\`${trigger}\``).length > 0 ? triggers.map(trigger => `\`${trigger}\``).join(", ") : strings.modules.help.noAliases}`,
        `**DESCRIPTION**: ${cmd.description || strings.modules.help.noDescription}`
      ];
      return msg.channel.send(message.join("\n"));
    } else {
      return errorMessage(msg, strings.general.error(strings.modules.help.noCommandFound));
    }
  }

  filterAdminCommands(msg: Message, commands: Command[]): Command[] {
    const cmds: Command[] = [];

    commands.forEach(command => {
      if (command.admin) {
        if (this.client.botAdmins.includes(msg.author.id)) cmds.push(command);
      } else cmds.push(command);
    });

    return cmds;
  }

  filterStaffCommands(msg: Message, commands: Command[]): Command[] {
    const cmds: Command[] = [];

    commands.forEach(command => {
      if (command.staff) {
        if (msg.member.roles.cache.some(role => [ROLES.MODERATOR, ROLES.ADMINISTRATORS, ROLES.LEAD_ADMINISTRATORS].includes(role.id))) cmds.push(command);
      } else cmds.push(command);
    });

    return cmds;
  }
}