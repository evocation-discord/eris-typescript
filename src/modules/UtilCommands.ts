import { Message } from "discord.js";
import { command, Module, ErisClient, inhibitors } from "@lib/utils";

export default class UtilCommandModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], single: true })
  echo(msg: Message, args: string) {
    msg.delete();
    msg.channel.send(args, { allowedMentions: { parse: [] }});
  }
}