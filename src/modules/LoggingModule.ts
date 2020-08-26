import { Module, monitor, escapeRegex, emotes, CHANNELS, linkRegex, ROLES, timeFormatter } from "@lib/utils";
import { Message, TextChannel } from "discord.js";
import { linkResolver } from "@lib/utils/linkResolver/linkResolver";

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

    if (cmd.staff || cmd.admin) return channel.send(`\`[${timeFormatter()}]\` **\`[ADMINISTRATIVE]\`** ${msg.client.emojis.resolve(emotes.LOGGING.ADMINISTRATIVE_AUDIT)} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`);
    return channel.send(`\`[${timeFormatter()}]\` ${msg.client.emojis.resolve(emotes.LOGGING.AUDIT)} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`);
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
        channel.send(
          `\`[${timeFormatter()}]\` **\`[LINK REDIRECT RESOLVER]\`** ${msg.client.emojis.resolve(emotes.LOGGING.LINK_RESOLVER)} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) sent a message (\`${msg.id}\`) containing a redirection-based link in ${msg.channel} (\`${msg.channel.id}\`).\n\n` +
          `**UNRESOLVED LINK**: <${_link}>\n` +
          `**RESOLVED LINK**: <${link}>\n\n` +
          "No automatic action has been taken against their account or the message itself. Please review the above to ensure that the link is not violative of Evocation's regulations..");
      }
    }
  }

  @monitor({ event: "guildMemberUpdate" })
  async onUsernameUpdate(msg: Message): Promise<Message> {
    if (msg.author && msg.author.bot) return;
    if (msg.channel.type === "dm") return;
    if (isStaff(msg)) return;
    const links = msg.content.match(linkRegex) || [];
    const channel = await this.client.channels.fetch(CHANNELS.MODERATION_LOG) as TextChannel;
    if (links.length) {
      for await (const _link of links) {
        const link = await linkResolver(_link);
        if (link === _link) continue;
        channel.send(
          `\`[${timeFormatter()}]\` **\`[LINK REDIRECT RESOLVER]\`** ${msg.client.emojis.resolve(emotes.LOGGING.LINK_RESOLVER)} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) sent a message (\`${msg.id}\`) containing a redirection-based link in ${msg.channel} (\`${msg.channel.id}\`).\n\n` +
          `**UNRESOLVED LINK**: <${_link}>\n` +
          `**RESOLVED LINK**: <${link}>\n\n` +
          "No automatic action has been taken against their account or the message itself. Please review the above to ensure that the link is not violative of Evocation's regulations..");
      }
    }
  }
}


const isStaff = (msg: Message): boolean => msg.member.roles.cache.some(role => [ROLES.MODERATION, ROLES.ADMINISTRATORS].includes(role.id));