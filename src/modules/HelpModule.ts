import { Message } from "discord.js";
import { command, Module, inhibitors, Optional, Command, ROLES, emotes } from "@lib/utils";
import { strings, commandDescriptions } from "@lib/utils/messages";

const commandGroupsWithEmojis = {
  "Bot Owner": "<:settings:747497421457588236> **BOT OWNER**",
  "Informational": "<:information:747497420954534050> **INFORMATIONAL**",
  "Giveaways": "<:donation:748230750805164032> **GIVEAWAYS**",
  "Server Administrator": "<:admin:747497421399130220> **SERVER ADMINISTRATOR**",
  "Permission Node Negations": "<:denial:747497421327695902> **PERMISSION NODE NEGATIONS**"
};

export default class HelpModule extends Module {

  @command({ group: "Informational", args: [new Optional(String)], usage: "[command:string]", description: commandDescriptions.help })
  async help(msg: Message, command?: string): Promise<void|Message> {
    const commands = Array.from(this.client.commandManager.cmds);
    if (!command) {
      const commandGroups = commands.map(cmd => cmd.group).filter((item, index, self) => self.indexOf(item) === index);
      const messageArray: string[] = [];

      for await (const commandGroup of commandGroups) {
        const cmds = this.filterStaffCommands(msg, this.filterAdminCommands(msg, commands.filter(cmd => cmd.group === commandGroup)));
        if (cmds.length === 0) continue;
        messageArray.push(`${commandGroupsWithEmojis[commandGroup] || strings.modules.help.unknownCategory}\n${cmds.map(cmd => `\`${process.env.PREFIX}${cmd.triggers[0]}\``).join(", ")}\n`);
      }
      messageArray.push(strings.modules.help.specificCommandHelp);
      msg.channel.send(messageArray.join("\n"));
    } else if (this.client.commandManager.getByTrigger(command)) {
      const cmd = this.client.commandManager.getByTrigger(command);
      if (cmd.admin) {
        if (!this.client.botAdmins.includes(msg.author.id)) return msg.channel.send(strings.general.error(strings.modules.help.noPermission));
      } else {
        if (cmd.staff) {
          if (!msg.member.roles.cache.some(role => [ROLES.MODERATION, ROLES.ADMINISTRATORS].includes(role.id))) return msg.channel.send(strings.general.error(strings.modules.help.noPermission));
        }
      }
      const triggers = [...cmd.triggers];
      const cmdName = triggers.shift();
      const message = [
        `**COMMAND**: \`${process.env.PREFIX}${cmdName}\``,
        `**SYNTACTIC USAGE**: ${cmd.usage ? `\`${cmd.usage}\`` : strings.modules.help.noArgumentsNeeded }`,
        `**ALIASES**: ${triggers.map(trigger => `\`${trigger}\``).length > 0 ? triggers.map(trigger => `\`${trigger}\``) : strings.modules.help.noAliases}`,
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
        if (msg.member.roles.cache.some(role => [ROLES.MODERATION, ROLES.ADMINISTRATORS].includes(role.id))) cmds.push(command);
      } else cmds.push(command);
    });

    return cmds;
  }
}