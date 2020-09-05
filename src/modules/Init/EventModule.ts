/* eslint-disable @typescript-eslint/ban-ts-comment */
import { listener, Module, ErisClient, monitor, scheduler, CHANNELS, strings, Embed } from "@lib/utils";
import { Guild, Message, TextChannel } from "discord.js";
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
    scheduler.loadEvents();
    Array.from(this.client.cronManager.crons).map(cron => cron.cronJob.fireOnTick());
    console.log("Bot up and running!");
    this.client.user.setActivity(`Evocation | ${process.env.PREFIX}`, { type: "WATCHING" });

    const embed = new Embed()
      .setTitle("Connected")
      .setColor("#4acf56")
      // @ts-ignore: Private property so typing for it does not exist
      .addField("Gateway Version", `v${this.client.options.ws.version}`)
      // @ts-ignore
      .addField("Session ID", this.client.ws.shards.first().sessionID);

    this.sendControlMessage(embed);
  }

  @listener({ event: "shardResume" })
  onResume(id: number, replayed: number): void {
    const embed = new Embed()
      .setTitle("Resumed")
      .setColor("#ffb347")
      .addField("Replayed Events", replayed);

    this.sendControlMessage(embed);
  }

  @listener({ event: "shardReconnecting" })
  onReconnect(): void {
    const embed = new Embed()
      .setTitle("Reconnected")
      .setColor("#ffb347")
      // @ts-ignore: Private property so typing for it does not exist
      .addField("Gateway Version", `v${this.client.options.ws.version}`)
      // @ts-ignore
      .addField("Session ID", this.client.ws.shards.first().sessionID);

    this.sendControlMessage(embed);
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
      const channel = await this.client.channels.fetch(CHANNELS.ERIS_LOG) as TextChannel;
      channel.send(strings.modules.events.announcementMessages(message));
    }
  }

  async sendControlMessage(data: Embed): Promise<void> {
    const embed = new Embed(data)
      .setFooter(`Eris ${process.env.PRODUCTION ? "Production" : "Testing"}`)
      .setTimestamp();

    if (!embed.color) embed.setColor("#779ecb");
    const channel = await this.client.channels.fetch(CHANNELS.ERIS_SYSTEM_LOG) as TextChannel;
    if (!channel) return;
    channel.send({ embed });
  }

}