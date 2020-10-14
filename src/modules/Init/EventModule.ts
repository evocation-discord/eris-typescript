/* eslint-disable @typescript-eslint/ban-ts-comment */
import { emotes, env } from "@utils/constants";
import Embed from "@utils/embed";
import { listener } from "@utils/listener";
import { strings } from "@utils/messages";
import { Module } from "@utils/modules";
import { monitor } from "@utils/monitor";
import scheduler from "@utils/scheduler";
import Discord from "discord.js";
import fetch from "node-fetch";

export default class EventModule extends Module {
  @listener({ event: "guildUpdate" })
  onGuildUpdate(oldGuild: Discord.Guild, newGuild: Discord.Guild): void {
    if (newGuild.id === process.env.MAIN_GUILD_ID && newGuild.name !== process.env.MAIN_GUILD_NAME) newGuild.edit({ name: process.env.MAIN_GUILD_NAME });
  }

  @listener({ event: "ready" })
  onReady(): void {
    scheduler.loadEvents();
    [...this.client.cronManager.crons].map((cron) => cron.cronJob.fireOnTick());
    console.log("Bot up and running!");
    this.client.user.setActivity(`Evocation | ${process.env.PREFIX}`, { type: "WATCHING" });

    setInterval(() => this.client.user.setActivity(`Evocation | ${process.env.PREFIX}`, { type: "WATCHING" }), 5400000);

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
  async onAnnouncementMessage(message: Discord.Message): Promise<void> {
    if (message.channel.type === "dm") return;
    if (message.guild.id !== env.MAIN_GUILD_ID) return;
    const { options: { http } } = this.client;
    if (message.channel.type === "news") {
      await fetch(
        `${http.api}/v${http.version}/channels/${message.channel.id}/messages/${message.id}/crosspost`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`
          }
        }
      );
      const channel = await this.client.channels.fetch(env.CHANNELS.ERIS_LOG) as Discord.TextChannel;
      channel.send(strings.modules.events.announcementMessages(message));
    }
  }

  async sendControlMessage(data: Embed): Promise<void> {
    const embed = new Embed(data)
      .setFooter(`Eris ${process.env.PRODUCTION ? "Production" : "Testing"}`)
      .setTimestamp();

    if (!embed.color) embed.setColor("#779ecb");
    const channel = await this.client.channels.fetch(env.CHANNELS.ERIS_SYSTEM_LOG) as Discord.TextChannel;
    if (!channel) return;
    channel.send({ embed });
  }

  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberUpdate(oldMember: Discord.GuildMember, newMember: Discord.GuildMember): Promise<void> {
    const addedRoles: Discord.Role[] = [];
    newMember.roles.cache.forEach((role) => {
      if (!oldMember.roles.cache.has(role.id)) addedRoles.push(role);
    });
    addedRoles.forEach((role) => this.client.emit("guildMemberRoleAdd", oldMember, newMember, role));
    const removedRoles: Discord.Role[] = [];
    oldMember.roles.cache.forEach((role) => {
      if (!newMember.roles.cache.has(role.id)) removedRoles.push(role);
    });
    removedRoles.forEach((role) => this.client.emit("guildMemberRoleRemove", oldMember, newMember, role));
  }

  @monitor({ event: "message" })
  async onFeedbackMessage(message: Discord.Message): Promise<void> {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    message.channel = message.channel as Discord.TextChannel;
    if (message.guild.id !== env.MAIN_GUILD_ID) return;
    if (message.channel.name !== "feedback") return;
    if (message.member.roles.cache.has(env.ROLES.ADMINISTRATORS) || message.member.roles.cache.has(env.ROLES.LEAD_ADMINISTRATORS)) return;
    await message.react(message.client.emojis.resolve(emotes.uncategorised.yyid));
    await message.react(emotes.uncategorised.nnid);
  }

  @monitor({ event: "messageReactionAdd" })
  async onFeedbackMessageReaction(reaction: Discord.MessageReaction, user: Discord.User): Promise<void> {
    if (user.bot) return;
    if (reaction.message.channel.type === "dm") return;
    reaction.message.channel = reaction.message.channel as Discord.TextChannel;
    if (reaction.message.guild.id !== env.MAIN_GUILD_ID) return;
    if (reaction.message.channel.name !== "feedback") return;
    if (reaction.message.author.id === user.id) reaction.users.remove(user);
  }
}
