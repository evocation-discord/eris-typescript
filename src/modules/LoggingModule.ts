import { Module, listener, monitor, escapeRegex, emotes, CHANNELS } from "@lib/utils";
import { Message } from "discord.js";
import { TextChannel } from "discord.js";
import dayjs from "dayjs";

export default class LoggingModule extends Module {
  @monitor({ events: ["message"] })
  async onCommand(msg: Message): Promise<void> {
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
    channel.send(`\`[${dayjs(new Date(), { utc: true })}]\` ${msg.client.emojis.resolve(emotes.LOGGING.AUDIT)} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`) in ${msg.channel} (\`${msg.channel.id}\`).`);
  }
}