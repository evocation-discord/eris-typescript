import { Module, listener, monitor, escapeRegex, emotes, CHANNELS } from "@lib/utils";
import { Message } from "discord.js";
import { TextChannel } from "discord.js";
import dayjs from "dayjs";

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

    if (cmd.staff) return channel.send(`\`[${timeFormatter()}]\` **\`[ADMINISTRATIVE]\`** ${msg.client.emojis.resolve(emotes.LOGGING.ADMINISTRATIVE_AUDIT)} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`);
    return channel.send(`\`[${timeFormatter()}]\` ${msg.client.emojis.resolve(emotes.LOGGING.AUDIT)} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`);
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