import { Module, monitor, escapeRegex, emotes, CHANNELS, linkRegex, ROLES } from "@lib/utils";
import { Message, TextChannel } from "discord.js";
import { linkResolver } from "@lib/utils/linkResolver/linkResolver";

export default class LoggingModule extends Module {
  @monitor({ events: ["message"] })
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

  @monitor({ events: ["message"] })
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
}

const timeFormatter = () => {
  const date = new Date();
  const _hour = `0${date.getUTCHours()}`;
  const _minutes = `0${date.getUTCMinutes()}`;
  const _day = `0${date.getUTCDate()}`;
  const _month = `0${date.getUTCMonth() + 1}`;
  const year = date.getUTCFullYear();

  const hour = _hour.slice(-2);
  const minutes = _minutes.slice(-2);
  const day = _day.slice(-2);
  const month = _month.slice(-2);
  return `${hour}:${minutes} ${day}/${month}/${year} UTC`;
};


const isStaff = (msg: Message): boolean => msg.member.roles.cache.some(role => [ROLES.MODERATION, ROLES.ADMINISTRATORS].includes(role.id));