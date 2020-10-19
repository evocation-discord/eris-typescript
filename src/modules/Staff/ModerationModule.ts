import inhibitors from "@utils/inhibitors";
import { commandDescriptions, errorMessage, strings } from "@utils/messages";
import { command, CommandCategories } from "@utils/commands";
import Discord from "discord.js";
import { Module } from "@utils/modules";
import { regex } from "@utils/constants";
import Embed from "@utils/embed";

export default class ModerationModule extends Module {
  @command({
    inhibitors: [inhibitors.moderatorOnly], group: CommandCategories.Moderation, args: [String], staff: true, usage: "<messageLink:string>", description: commandDescriptions.quote
  })
  async quote(msg: Discord.Message, messageLink: string): Promise<Discord.Message|void> {
    msg.delete();
    const executedRegex = regex.messageLink.exec(messageLink);
    if (!executedRegex) return errorMessage(msg, strings.general.error(strings.modules.util.linkDoesNotMatchDiscordLink));
    const [, guildId, channelId, messageId] = regex.messageLink.exec(messageLink);
    try {
      const guild = this.client.guilds.resolve(guildId);
      if (!guild) return errorMessage(msg, strings.general.error(strings.modules.util.guildWasNotFound(guildId)));
      const channel = guild.channels.resolve(channelId) as Discord.TextChannel;
      if (!channel) return errorMessage(msg, strings.general.error(strings.modules.util.channelWasNotFound(channelId)));
      if (["Staff", "Oversight & Development", "Moderator Inbox", "Eris Registers"].includes(channel.parent.name)) return errorMessage(msg, strings.general.error(strings.modules.moderation.quote.restrictedChannel));
      if (["729429041022500885"].includes(channel.id)) return errorMessage(msg, strings.general.error(strings.modules.moderation.quote.restrictedChannel));
      const message = await channel.messages.fetch(messageId);
      if (!message) return errorMessage(msg, strings.general.error(strings.modules.util.messageWasNotFound(messageId)));
      if (message.author.bot) return errorMessage(msg, strings.general.error(strings.modules.moderation.quote.bot));

      const embed = new Embed()
        .setAuthor(strings.modules.moderation.quote.embedAuthor(message), message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(message.content)
        .attachFiles(message.attachments.map((a) => a))
        .setFooter(strings.modules.moderation.quote.embedFooter(message.id, channel.name));
      return msg.channel.send(embed);
    } catch (e) {
      errorMessage(msg, strings.general.error(strings.modules.moderation.quote.unknownError));
    }
  }
}
