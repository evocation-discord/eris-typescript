import { listener, Module, ErisClient, monitor } from "@lib/utils";
import { Guild, Message } from "discord.js";
import fetch from "node-fetch";

export default class EventModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }
  @listener({ event: "guildUpdate" })
  onGuildUpdate(oldGuild: Guild, newGuild: Guild): void {
    if (newGuild.id === process.env.MAIN_GUILD_ID && newGuild.name !== process.env.MAIN_GUILD_NAME) newGuild.edit({ name: process.env.MAIN_GUILD_NAME });
  }

  @listener({ event: "ready" })
  onReady(): void {
    console.log("Bot up and running!");
    this.client.user.setActivity(`Evocation | ${process.env.PREFIX}`, { type: "WATCHING" });
  }

  @monitor({ event: "message" })
  async onAnnouncementMessage(message: Message): Promise<void> {
    const { options: { http } } = this.client;
    if (message.channel.type === "news") {
      await fetch(
        `${http.api}/v${http.version}/channels/${message.channel.id}/messages/${message.id}/crosspost`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bot ${process.env.DISCORD_TOKEN}`,
          },
        },
      );
    }
  }


}