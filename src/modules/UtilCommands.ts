import { Message } from "discord.js";
import { command, Module, ErisClient, inhibitors, Remainder } from "@lib/utils";
import { PresenceStatusData } from "discord.js";

export default class UtilCommandModule extends Module {

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [new Remainder(String)] })
  echo(msg: Message, args: string) {
    msg.delete();
    msg.channel.send(args, { allowedMentions: { parse: [], users: [], roles: [] } });
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [String] })
  setstatus(msg: Message, status: "online" | "idle" | "dnd" | "invisible" | string) {
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
  setgame(msg: Message, type: "watching" | "playing" | "listening", game: string) {
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
}