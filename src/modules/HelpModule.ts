import { Message } from "discord.js";
import { command, Module, Optional, Command, ROLES, CommandCategories, commandDescriptions, strings, emotes } from "@lib/utils";

const commandGroupsWithEmojis = {
  "Bot Owner": `${emotes.commandresponses.settings} **BOT OWNER**`,
  "Informational": `${emotes.commandresponses.information} **INFORMATIONAL**`,
  "Giveaways": `${emotes.giveaway.donation} **GIVEAWAYS**`,
  "Server Administrator": `${emotes.commandresponses.admin} **SERVER ADMINISTRATOR**`,
  "Moderation": `${emotes.commandresponses.moderation} **MODERATION**`,
  "Purchasable Role Limitation": `${emotes.commandresponses.creditcard} **PURCHASABLE ROLE LIMITATION**`,
  "Levelling System": `${emotes.commandresponses.experience} **LEVELLING SYSTEM**`
};

export default class HelpModule extends Module {

  @command({ group: CommandCategories.Informational, args: [new Optional(String)], usage: "[command:string]", description: commandDescriptions.help })
  async help(msg: Message, command?: string): Promise<void|Message> {
    const commands = Array.from(this.client.commandManager.cmds);
    if (!command) {
      const commandGroups = commands.map(cmd => cmd.group).filter((item, index, self) => self.indexOf(item) === index);
      const messageArray: string[] = [];

      for await (const commandGroup of commandGroups) {
        const cmds = this.filterStaffCommands(msg, this.filterAdminCommands(msg, commands.filter(cmd => cmd.group === commandGroup)));
        if (cmds.length === 0) continue;
        messageArray.push(`${commandGroupsWithEmojis[commandGroup] || strings.modules.help.unknownCategory}\n${cmds.sort((a, b) => a.triggers[0].localeCompare(b.triggers[0])).map(cmd => `\`${process.env.PREFIX}${cmd.triggers[0]}\``).join(", ")}\n`);
      }
      messageArray.push(strings.modules.help.specificCommandHelp);
      msg.channel.send(messageArray.join("\n"));
    } else if (this.client.commandManager.getByTrigger(command)) {
      const cmd = this.client.commandManager.getByTrigger(command);
      if (cmd.admin) {
        if (!this.client.botAdmins.includes(msg.author.id)) return msg.channel.send(strings.general.error(strings.modules.help.noPermission));
      } else {
        if (cmd.staff) {
          if (!msg.member.roles.cache.some(role => [ROLES.STAFF, ROLES.ADMINISTRATORS].includes(role.id))) return msg.channel.send(strings.general.error(strings.modules.help.noPermission));
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
      return msg.channel.send(strings.general.error(strings.modules.help.noCommandFound));
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