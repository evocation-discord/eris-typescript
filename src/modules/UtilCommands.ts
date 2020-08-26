import { Message } from "discord.js";
import { command, Module, inhibitors, Remainder, RESPONSES } from "@lib/utils";
import { PresenceStatusData } from "discord.js";
import { TextChannel } from "discord.js";
import { Client } from "discord.js";
import { inspect } from "util";

export default class UtilCommandModule extends Module {

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: "Bot Owner", args: [TextChannel, new Remainder(String)], admin: true, usage: "<channel:textchannel|snowflake> <content:...string>" })
  send(msg: Message, channel: TextChannel, args: string): void {
    msg.delete();
    channel.send(args, { allowedMentions: { parse: [], users: [], roles: [] } });
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: "Bot Owner", args: [String], admin: true, usage: "<status:online|idle|dnd|invisible>" })
  setstatus(msg: Message, status: "online" | "idle" | "dnd" | "invisible" | string): Promise<Message> {
    const discordStatus = status as PresenceStatusData;
    switch (discordStatus) {
    case "online":
      status = status.toUpperCase();
      this.client.user.setStatus(discordStatus);
      break;
    case "dnd":
      status = "DO NOT DISTURB";
      this.client.user.setStatus(discordStatus);
      break;

    case "idle":
      status = status.toUpperCase();
      this.client.user.setStatus(discordStatus);
      break;

    case "invisible":
      status = status.toUpperCase();
      this.client.user.setStatus(discordStatus);
      break;

    default:
      return msg.channel.send("**ERROR**: Status needs to be `online`, `dnd`, `idle` or `invisible`.");

    }
    return msg.channel.send(RESPONSES.SUCCESS(msg, `My status is now **${status}**.`));
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: "Bot Owner", args: [String, new Remainder(String)], admin: true, usage: "<status:watching|playing|listening>" })
  setgame(msg: Message, type: "watching" | "playing" | "listening", game: string): Promise<Message> {
    switch (type) {
    case "listening":
      this.client.user.setActivity(game, { type: "LISTENING" });
      break;
    case "watching":
      this.client.user.setActivity(game, { type: "WATCHING" });
      break;
    case "playing":
      this.client.user.setActivity(game, { type: "PLAYING" });
      break;
    default:
      return msg.channel.send("**ERROR**: Type needs to be `watching`, `playing` or `listening`.");
    }
    return msg.channel.send(RESPONSES.SUCCESS(msg, `I'm now ${type}${type === "listening" ? " to" : ""} **${game}**.`));
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: "Bot Owner", args: [String, new Remainder(String)], admin: true, usage: "<messageLink:string> <newContent:...string>" })
  async edit(msg: Message, messageLink: string, newContent: string): Promise<Message> {
    let isError = false;
    const messageLinkRegex = /^(?:https?):\/\/(?:(?:(?:canary|ptb)\.)?(?:discord|discordapp)\.com\/channels\/)(@me|\d+)\/(\d+)\/(\d+)$/g;
    const executedRegex = messageLinkRegex.exec(messageLink);
    if (!executedRegex) return msg.channel.send("**ERROR**: Link doesnt match a discord message link.");
    const [, guildId, channelId, messageId] = executedRegex;
    const guild = this.client.guilds.resolve(guildId);
    if (!guild) return msg.channel.send(`**ERROR**: Guild with ID ${guildId} was not found.`);
    const channel = guild.channels.resolve(channelId) as TextChannel;
    if (!channel) return msg.channel.send(`**ERROR**: Channel with ID ${channelId} was not found.`);
    const message = await channel.messages.fetch(messageId);
    if (!message) return msg.channel.send(`**ERROR**: Message with ID ${messageId} was not found.`);
    await message.edit(newContent).catch(_ => isError = true);
    if (isError) return msg.channel.send("**ERROR**: Something went wrong.");
    return msg.channel.send(RESPONSES.SUCCESS(msg, "Message has been edited."));
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: "Informational", usage: "No usage" })
  about(msg: Message): Promise<Message> {
    return msg.channel.send(
      "Hi! I am a custom bot designed for exclusive use by Evocation staff and members. An impermeable forcefield that surrounds the universe of Evocation prohibits me from being able to join and interact with other servers.\n\n" +
      "__**CONTRIBUTORS**__\n\n" +
    "**DEVELOPMENT TEAM LEAD**: <@209609796704403456>\n" +
    "**DEVELOPER**: <@222073294419918848>\n" +
    "**CHARACTER CONCEPTUALIST**: <@369497100834308106>", { allowedMentions: { users: [] } });
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: "Bot Owner", args: [new Remainder(String)], aliases: ["ev"], admin: true, usage: "<code:...string>" })
  async eval(msg: Message, code: string): Promise<void> {
    const client = msg.client;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Discord = require("discord.js");
    try {
      const evaled = eval(code);
      const clean = await codeclean(msg.client, evaled);
      msg.channel.send(`\`\`EVAL\`\`\n\`\`\`xl\n${clean}\`\`\``);
    }
    catch (err) {
      msg.channel.send(`\`ERROR\` \`\`\`xl\n${await codeclean(msg.client, err)}\n\`\`\``);
    }
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: "Bot Owner", aliases: ["kill", "die"], admin: true })
  async shutdown(msg: Message): Promise<void> {
    await msg.channel.send(RESPONSES.SUCCESS(msg, "I can feel my Drearian Spirit fading..."));
    process.exit(0);
  }
}

const codeclean = async (client: Client, text: string): Promise<string> => {
  if (text && text.constructor.name === "Promise")
    text = await text;
  if (typeof text !== "string")
    text = inspect(text, {
      depth: 0
    });
  text = text
    .replace(/`/g, `\`${String.fromCharCode(8203)}`)
    .replace(/@/g, `@${String.fromCharCode(8203)}`)
    .replace(client.token, "http://discord.com/developers");
  return text;
};