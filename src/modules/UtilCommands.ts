import { Message } from "discord.js";
import { command, Module, inhibitors, Remainder } from "@lib/utils";
import { PresenceStatusData } from "discord.js";
import { TextChannel } from "discord.js";

export default class UtilCommandModule extends Module {

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [new Remainder(String)] })
  echo(msg: Message, args: string): void {
    msg.delete();
    msg.channel.send(args, { allowedMentions: { parse: [], users: [], roles: [] } });
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [String] })
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
    return msg.channel.send(`**SUCCESS**: My status is now **${status}**.`);
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [String, new Remainder(String)] })
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
    return msg.channel.send(`**SUCCESS**: I'm now ${type}${type === "listening" ? " to" : ""} **${game}**.`);
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [String, new Remainder(String)] })
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
    return msg.channel.send("**SUCCESS**: Message has been edited.");
  }
}