import { Message } from "discord.js";
import { command, Module, ErisClient, inhibitors, Remainder } from "@lib/utils";

export default class UtilCommandModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [new Remainder(String)] })
  echo(msg: Message, ...args: string[]) {
    msg.delete();
    msg.channel.send(args.join(" "), { allowedMentions: { parse: [], users: [], roles: [] }});
  }
}