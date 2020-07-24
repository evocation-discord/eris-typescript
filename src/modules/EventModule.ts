import { Message } from "discord.js";
import { command, listener, Module, ErisClient } from "@lib/utils";

export default class EventModule extends Module {
  constructor(client: ErisClient) {
      super(client);
  }
  @listener({ event: "message" })
  onMessage(msg: Message) {
      console.log("anotherModule onMessage", msg.content);
  }

  @command()
  ping(msg: Message) {
      msg.reply("pong");
  }
}