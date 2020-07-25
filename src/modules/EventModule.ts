import { listener, Module, ErisClient } from "@lib/utils";
import { Guild } from "discord.js";

export default class EventModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }
  @listener({ event: "guildUpdate" })
  onGuildUpdate(oldGuild: Guild, newGuild: Guild) {
    if (newGuild.id == process.env.MAIN_GUILD_ID && newGuild.name !== process.env.MAIN_GUILD_NAME) newGuild.edit({ name: process.env.MAIN_GUILD_NAME });
  }

  @listener({ event: "ready" })
  onReady() {
    console.log("Bot up and running!");
    this.client.user.setActivity(`Evocation | ${process.env.PREFIX}`, { type: "WATCHING" });
  }
}