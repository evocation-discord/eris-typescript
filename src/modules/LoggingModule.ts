import { Module, monitor, escapeRegex, emotes, CHANNELS, linkRegex, ROLES, timeFormatter } from "@lib/utils";
import { Message, TextChannel, User } from "discord.js";
import { linkResolver } from "@lib/utils/linkResolver/linkResolver";
import { strings } from "@lib/utils/messages";
import { DisabledCommand } from "@lib/utils/database/models";

export default class LoggingModule extends Module {
  @monitor({ event: "message" })
  async onCommand(msg: Message): Promise<Message> {
    if (msg.author && msg.author.bot) return;

    const prefix = process.env.PREFIX;
    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(msg.content)) return;

    const [, matchedPrefix] = msg.content.match(prefixRegex);

    const noPrefix = msg.content.slice(matchedPrefix.length).trim();
    const stringArgs: string[] = noPrefix.split(" ").slice(1) || [];
    const cmdTrigger = noPrefix.split(" ")[0].toLowerCase();
    const cmd = this.client.commandManager.getByTrigger(cmdTrigger);
    if (!cmd) return;

    const channel = await msg.client.channels.fetch(CHANNELS.ERIS_LOG) as TextChannel;

    if (await DisabledCommand.findOne({ where: { commandName: cmd.triggers[0] } })) return channel.send(strings.modules.logging.disabledCommand(msg, cmdTrigger, stringArgs));
    if (cmd.staff || cmd.admin) return channel.send(strings.modules.logging.administrativeCommand(msg, cmdTrigger, stringArgs));
    return channel.send(strings.modules.logging.command(msg, cmdTrigger, stringArgs));
  }

  @monitor({ event: "message" })
  async onLink(msg: Message): Promise<Message> {
    if (msg.author && msg.author.bot) return;
    if (msg.channel.type === "dm") return;
    if (isStaff(msg)) return;
    const links = msg.content.match(linkRegex) || [];
    const channel = await this.client.channels.fetch(CHANNELS.MODERATION_LOG) as TextChannel;
    if (links.length) {
      for await (const _link of links) {
        const link = await linkResolver(_link);
        if (link === _link) continue;
        channel.send(strings.modules.logging.linkResolver(msg, _link, link));
      }
    }
  }

  @monitor({ event: "userUpdate" })
  async onUsernameUpdate(oldUser: User, newUser: User): Promise<Message> {
    if (newUser.bot) return;
    if (oldUser.username !== newUser.username) {
      const channel = await this.client.channels.fetch(CHANNELS.DENOMINATION_LOG) as TextChannel;
      channel.send(strings.modules.logging.userUpdate(oldUser, newUser), { allowedMentions: { users: [] } });
    }
  }
}


const isStaff = (msg: Message): boolean => msg.member.roles.cache.some(role => [ROLES.STAFF, ROLES.ADMINISTRATORS].includes(role.id));