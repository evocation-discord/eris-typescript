/* eslint-disable no-continue */
import { env } from "@utils/constants";
import { strings } from "@utils/messages";
import { Module } from "@utils/modules";
import Discord from "discord.js";
import { monitor } from "@utils/monitor";
import { DisabledCommand } from "@database/models";
import regex, { escapeRegex } from "@utils/constants/regex";
import linkResolver from "@utils/linkResolver";

export default class LoggingModule extends Module {
  @monitor({ event: "message" })
  async onCommand(msg: Discord.Message): Promise<Discord.Message> {
    if (msg.author && msg.author.bot) return;
    if (msg.channel.type === "dm") return;
    if (msg.guild.id !== env.MAIN_GUILD_ID) return;

    const prefix = process.env.PREFIX;
    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(msg.content)) return;

    const [, matchedPrefix] = msg.content.match(prefixRegex);

    const noPrefix = msg.content.slice(matchedPrefix.length).trim();
    const stringArgs: string[] = noPrefix.split(" ").slice(1) || [];
    const cmdTrigger = noPrefix.split(" ")[0].toLowerCase();
    const cmd = this.client.commandManager.getByTrigger(cmdTrigger);
    if (!cmd) return;

    const channel = await msg.client.channels.fetch(env.CHANNELS.ERIS_LOG) as Discord.TextChannel;

    if (await DisabledCommand.findOne({ where: { commandName: cmd.triggers[0] } })) return channel.send(strings.modules.logging.disabledCommand(msg, cmdTrigger, stringArgs));
    if (cmd.staff || cmd.admin) return channel.send(strings.modules.logging.administrativeCommand(msg, cmdTrigger, stringArgs));
    return channel.send(strings.modules.logging.command(msg, cmdTrigger, stringArgs));
  }

  @monitor({ event: "message" })
  async onLink(msg: Discord.Message): Promise<Discord.Message> {
    if (msg.author && msg.author.bot) return;
    if (msg.channel.type === "dm") return;
    if (msg.guild.id !== env.MAIN_GUILD_ID) return;
    if (isStaff(msg)) return;
    const links = msg.content.match(regex.link) || [];
    const channel = await this.client.channels.fetch(env.CHANNELS.MODERATION_LOG) as Discord.TextChannel;
    if (links.length) {
      for await (const _link of links) {
        const link = await linkResolver(_link);
        if (link.startsWith("https://discord.com/")) continue;
        if (((_link.startsWith("https://m.youtube.com/") || _link.startsWith("http://m.youtube.com/")) && link.startsWith("https://www.youtube.com"))) continue;
        if (((_link.startsWith("https://youtu.be/") || _link.startsWith("http://youtu.be/")) && link.startsWith("https://www.youtube.com"))) continue;
        if (((_link.startsWith("https://tenor.com/") || _link.startsWith("http://tenor.com/")) && link.startsWith("https://www.tenor.com"))) continue;
        const diff = getDifference(_link, link);
        if (diff && diff === "www.") continue;
        if (link === _link) continue;
        channel.send(strings.modules.logging.linkResolver(msg, _link, link));
      }
    }
  }

  @monitor({ event: "userUpdate" })
  async onUsernameUpdate(oldUser: Discord.User, newUser: Discord.User): Promise<Discord.Message> {
    if (newUser.bot) return;
    if (oldUser.username !== newUser.username) {
      const channel = await this.client.channels.fetch(env.CHANNELS.DENOMINATION_LOG) as Discord.TextChannel;
      channel.send(strings.modules.logging.userUpdate(oldUser, newUser), { allowedMentions: { users: [] } });
    }
  }

  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd(oldMember: Discord.GuildMember, newMember: Discord.GuildMember): Promise<void> {
    if (newMember.guild.id !== env.MAIN_GUILD_ID) return;
    if (!oldMember.roles.cache.has(env.ROLES.EOS) && newMember.roles.cache.has(env.ROLES.EOS)) {
      const channel = newMember.guild.channels.cache.find((c) => c.name === "lounge") as Discord.TextChannel;
      channel.send(strings.modules.logging.userBoost(newMember.user));
    }
  }
}

const isStaff = (msg: Discord.Message): boolean => msg.member.roles.cache.some((role) => [env.ROLES.STAFF, env.ROLES.ADMINISTRATORS].includes(role.id));

const getDifference = (a: string, b: string): string => {
  let i = 0; let j = 0; let
    result = "";
  while (j < b.length) {
    if (a[i] !== b[j] || i === a.length) result += b[j];
    else i++;
    j++;
  }
  if (result.endsWith("./")) result = result.slice(0, -1);
  return result;
};
