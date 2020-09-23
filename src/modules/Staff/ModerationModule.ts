import { command, CommandCategories, commandDescriptions, Embed, inhibitors, messageLinkRegex, Module, strings } from "@lib/utils";
import { Message, TextChannel } from "discord.js";

export default class ModerationModule extends Module {

  @command({ inhibitors: [inhibitors.moderatorOnly], group: CommandCategories["Moderation"], args: [String], staff: true, usage: "<messageLink:string> <newContent:...string>", description: commandDescriptions.quote })
  async quote(msg: Message, messageLink: string): Promise<void | Message> {
    msg.delete();
    const executedRegex = messageLinkRegex.exec(messageLink);
    if (!executedRegex) return msg.channel.send(strings.general.error(strings.modules.util.linkDoesNotMatchDiscordLink));
    const [, guildId, channelId, messageId] = executedRegex;
    try {
      const guild = this.client.guilds.resolve(guildId);
      if (!guild) return msg.channel.send(strings.general.error(strings.modules.util.guildWasNotFound(guildId)));
      const channel = guild.channels.resolve(channelId) as TextChannel;
      if (!channel) return msg.channel.send(strings.general.error(strings.modules.util.channelWasNotFound(channelId)));
      if (["Staff", "Oversight & Development", "Moderator Inbox", "Eris Registers"].includes(channel.parent.name)) return msg.channel.send(strings.general.error(strings.modules.moderation.quote.restrictedChannel));
      const message = await channel.messages.fetch(messageId);
      if (!message) return msg.channel.send(strings.general.error(strings.modules.util.messageWasNotFound(messageId)));
      if (message.author.bot) return msg.channel.send(strings.general.error(strings.modules.moderation.quote.bot));

      const embed = new Embed()
        .setAuthor(strings.modules.moderation.quote.embedAuthor(message), message.author.displayAvatarURL({ dynamic: true, format: "png" }))
        .setDescription(message.content)
        .attachFiles(message.attachments.map(a => a))
        .setFooter(strings.modules.moderation.quote.embedFooter(message.id, channel.name));
      msg.channel.send(embed);
    } catch (e) {
      msg.channel.send(strings.general.error(strings.modules.moderation.quote.unknownError));
    }
  }
}