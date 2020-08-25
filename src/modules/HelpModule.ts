import { Message } from "discord.js";
import { command, Module, inhibitors, Optional, Command, ROLES, emotes } from "@lib/utils";

const commandGroupsWithEmojis = {
  "Bot Owner": "<:settings:747497421457588236> **BOT OWNER**",
  "Informational": "<:information:747497420954534050> **INFORMATIONAL**",
  "Server Administrator": "<:admin:747497421399130220> **SERVER ADMINISTRATOR**",
  "Permission Node Negations": "<:denial:747497421327695902> **PERMISSION NODE NEGATIONS**"
};

export default class HelpModule extends Module {

  @command({ group: "Informational", args: [new Optional(String)], usage: "[command:string]" })
  async help(msg: Message, command?: string): Promise<void|Message> {
    const commands = Array.from(this.client.commandManager.cmds);
    if (!command) {
      const commandGroups = commands.map(cmd => cmd.group).filter((item, index, self) => self.indexOf(item) === index);
      const messageArray: string[] = [];

      for await (const commandGroup of commandGroups) {
        const cmds = this.filterStaffCommands(msg, this.filterAdminCommands(msg, commands.filter(cmd => cmd.group === commandGroup)));
        if (cmds.length === 0) continue;
        messageArray.push(`${commandGroupsWithEmojis[commandGroup]}\n${cmds.map(cmd => `\`${process.env.PREFIX}${cmd.triggers[0]}\``).join(", ")}\n`);
      }
      messageArray.push(`To get more information about a specific command, run \`${process.env.PREFIX}help [command]\`.`);
      msg.channel.send(messageArray.join("\n"));
    } else if (this.client.commandManager.getByTrigger(command)) {
      const cmd = this.client.commandManager.getByTrigger(command);
      if (cmd.admin) {
        if (!this.client.botAdmins.includes(msg.author.id)) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **ERROR**: I cannot retrieve additional information about this command as you do not satisfy its permission criteria.`);
      } else {
        if (cmd.staff) {
          if (!msg.member.roles.cache.some(role => [ROLES.MODERATION, ROLES.ADMINISTRATORS].includes(role.id))) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **ERROR**: I cannot retrieve additional information about this command as you do not satisfy its permission criteria.`);
        }
      }
      const triggers = [...cmd.triggers];
      const cmdName = triggers.shift();
      const message = [
        `**COMMAND**: \`${process.env.PREFIX}${cmdName}\``,
        `**SYNTACTIC USAGE**: \`${cmd.usage || "No arguments need to be either mandatorily or optionally provided for this command."}\``,
        `**ALIASES**: ${triggers.map(trigger => `\`${trigger}\``).length > 0 ? triggers.map(trigger => `\`${trigger}\``) : "No aliases exist for this command."}`,
        `**COMMAND DESCRIPTION**: ${cmd.description || "No description"}`
      ];
      return msg.channel.send(message.join("\n"));
    } else {
      return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **ERROR**: No command exists with that name or alias. Please reinspect its spelling, as that may be a potential factor as to why it cannot be resolved.`);
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