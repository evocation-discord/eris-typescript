/* eslint-disable no-continue */
import inhibitors from "@utils/inhibitors";
import strings, { commandDescriptions } from "@utils/messages";
import { command, CommandCategories } from "@utils/commands";
import Discord from "discord.js";
import { Module } from "@utils/modules";
import { env, regex } from "@utils/constants";
import Embed from "@utils/embed";
import { monitor } from "@utils/monitor";
import { escapeRegex } from "@utils/constants/regex";

export default class ModerationModule extends Module {
  @command({
    inhibitors: [inhibitors.moderatorOnly], group: CommandCategories.Moderation, args: [String], staff: true, usage: "<messageLink:string>", description: commandDescriptions.quote
  })
  async quote(msg: Discord.Message, messageLink: string): Promise<void> {
    msg.delete();
    const executedRegex = regex.messageLink.exec(messageLink);
    if (!executedRegex) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.linkDoesNotMatchDiscordLink));
    const [, guildId, channelId, messageId] = executedRegex;
    try {
      const guild = this.client.guilds.resolve(guildId);
      if (!guild) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.guildWasNotFound(guildId)));
      const channel = guild.channels.resolve(channelId) as Discord.TextChannel;
      if (!channel) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.channelWasNotFound(channelId)));
      if (["Staff", "Development", "Moderator Inbox", "Eris Registers"].includes(channel.parent.name)) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.quote.restrictedChannel));
      if (["729429041022500885"].includes(channel.id)) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.quote.restrictedChannel));
      const message = await channel.messages.fetch(messageId);
      if (!message) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.messageWasNotFound(messageId)));
      if (message.author.bot) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.quote.bot));

      const embed = new Embed()
        .setAuthor(strings.modules.moderation.quote.embedAuthor(message), message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(message.content)
        .attachFiles(message.attachments.map((a) => a))
        .setFooter(strings.modules.moderation.quote.embedFooter(message.id, channel.name));
      msg.channel.send(embed);
    } catch (e) {
      strings.errors.errorMessage(msg, strings.errors.error(strings.modules.moderation.quote.unknownError));
    }
  }

  @monitor({ event: "message" })
  async onMessage(msg: Discord.Message): Promise<void> {
    try {
      if (!msg.guild) return;
      if (msg.guild.id !== env.MAIN_GUILD_ID) return;
      if (msg.author.bot) return;
      if (!msg.guild.members.resolve(msg.author.id).roles.cache.some((role) => [env.ROLES.STAFF, env.ROLES.MODERATOR, env.ROLES.ADMINISTRATORS, env.ROLES.LEAD_ADMINISTRATORS].includes(role.id))) return;
      const prefix = process.env.PREFIX;
      const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`);
      if (prefixRegex.test(msg.content)) return;

      const messageLinks = msg.content.match(regex.messageLinkg) ?? [];
      if (messageLinks.length > 0) msg.delete();
      for await (const link of messageLinks) {
        const executedRegex = regex.messageLink.exec(link);
        const [, guildId, channelId, messageId] = executedRegex;
        const guild = this.client.guilds.resolve(guildId);
        if (!guild || guild.id !== env.MAIN_GUILD_ID) continue;
        const channel = guild.channels.resolve(channelId) as Discord.TextChannel;
        if (!channel) continue;
        if (["Staff", "Development", "Moderator Inbox", "Eris Registers"].includes(channel.parent.name)) continue;
        if (["729429041022500885"].includes(channel.id)) continue;
        const message = await channel.messages.fetch(messageId);
        if (!message) continue;
        if (message.author.bot) continue;

        const embed = new Embed()
          .setAuthor(strings.modules.moderation.quote.embedAuthor(message), message.author.displayAvatarURL({ dynamic: true, format: "png" }))
          .setDescription(message.content)
          .attachFiles(message.attachments.map((a) => a))
          .setFooter(strings.modules.moderation.quote.embedFooter(message.id, channel.name));
        msg.channel.send(embed);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
