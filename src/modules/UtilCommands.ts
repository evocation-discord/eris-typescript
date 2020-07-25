import { Message } from "discord.js";
import { command, Module, ErisClient, inhibitors, Remainder } from "@lib/utils";
import { PresenceStatusData } from "discord.js";

export default class UtilCommandModule extends Module {

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [new Remainder(String)] })
  echo(msg: Message, ...args: string[]) {
    msg.delete();
    msg.channel.send(args.join(" "), { allowedMentions: { parse: [], users: [], roles: [] } });
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
        return msg.channel.send("**ERROR**: Status needs to be `online`, `dnd`, `idle` or `invisible`");

    }
    return msg.channel.send(`**SUCCESS**: My status is now **${status}**.`);
  }
}