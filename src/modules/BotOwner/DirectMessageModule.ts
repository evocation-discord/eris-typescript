import { command, CommandCategories } from "@utils/commands";
import { emotes, env, regex, colors } from "@utils/constants";
import { commandDescriptions, errorMessage, strings } from "@utils/messages";
import { Module } from "@utils/modules";
import * as Arguments from "@utils/arguments";
import Discord from "discord.js";
import { inhibitors } from "@utils/inhibitors/Inhibitor";
import Embed from "@utils/embed";
import { monitor } from "@utils/monitor";

export default class DirectMessageModule extends Module {

  @monitor({ event: "message" })
  async DM_receiver(message: Discord.Message): Promise<void> {
    if (message.author.bot) return;
    if (message.partial) message = await message.fetch();
    if (message.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(env.CHANNELS.DIRECT_MESSAGE_LOG) as Discord.TextChannel;
    const embed = new Embed()
      .setTimestamp()
      .setColor(colors.DM_SEND_MESSAGE)
      .setFooter(strings.modules.directmessages.embedFooter(message.id))
      .setAuthor(strings.modules.directmessages.embedAuthor(message), message.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(message.content);
    if (message.attachments.size > 0) embed.addField(strings.modules.directmessages.attachments, message.attachments.map(attachment => attachment.url).join("\n"));
    channel.send(strings.modules.directmessages.directMessageReceived, embed);
  }

  @monitor({ event: "messageUpdate" })
  async DM_receiver_on_edit(oldMsg: Discord.Message, newMsg: Discord.Message): Promise<void> {
    if (newMsg.partial) newMsg = await newMsg.fetch();
    if (newMsg.author.bot) return;
    if (newMsg.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(env.CHANNELS.DIRECT_MESSAGE_LOG) as Discord.TextChannel;
    const embed = new Embed()
      .setTimestamp()
      .setColor(colors.DM_EDITED_MESSAGE)
      .setFooter(strings.modules.directmessages.embedFooter(newMsg.id))
      .setAuthor(strings.modules.directmessages.embedAuthor(newMsg), newMsg.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .addField(strings.modules.directmessages.originalMessage, oldMsg.content || strings.modules.directmessages.orignalContentError)
      .addField(strings.modules.directmessages.editedMessage, newMsg.content);
    if (newMsg.attachments.size > 0) embed.addField(strings.modules.directmessages.attachments, newMsg.attachments.map(attachment => attachment.url).join("\n"));
    channel.send(strings.modules.directmessages.directMessageEdited, embed);
  }

  @monitor({ event: "messageDelete" })
  async DM_receiver_on_delete(msg: Discord.Message): Promise<void> {
    if (msg.partial) return;
    if (msg.author.bot) return;
    if (msg.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(env.CHANNELS.DIRECT_MESSAGE_LOG) as Discord.TextChannel;
    const embed = new Embed()
      .setTimestamp()
      .setColor(colors.DM_DELETED_MESSAGE)
      .setFooter(strings.modules.directmessages.embedFooter(msg.id))
      .setAuthor(strings.modules.directmessages.embedAuthor(msg), msg.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(msg.content);
    if (msg.attachments.size > 0) embed.addField(strings.modules.directmessages.attachments, msg.attachments.map(attachment => attachment.proxyURL).join("\n"));
    channel.send(strings.modules.directmessages.directMessageDeleted, embed);
  }

  @command({ aliases: ["dm"], group: CommandCategories["Bot Owner"], inhibitors: [inhibitors.botAdminsOnly], args: [Arguments.User, new Arguments.Remainder(String)], admin: true, usage: "<user:user|snowflake> <content:...string>", description: commandDescriptions.directmessage })
  async directmessage(message: Discord.Message, user: Discord.User, content: string): Promise<void> {
    await message.delete();
    const msg = await user.send(content);
    const channel = await this.client.channels.fetch(env.CHANNELS.DIRECT_MESSAGE_LOG) as Discord.TextChannel;
    const embed = new Embed()
      .setTimestamp()
      .setColor(colors.DM_SEND_MESSAGE)
      .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setFooter(strings.modules.directmessages.embedFooter(msg.id))
      .setDescription(msg.content);
    channel.send(strings.modules.directmessages.commands.directMessageSentExecution(message, user), embed);
    message.channel.send(strings.general.success(strings.modules.directmessages.commands.directMessageSent(user, msg.content)));
  }
  @command({ aliases: ["deletedm"], group: CommandCategories["Bot Owner"], inhibitors: [inhibitors.botAdminsOnly], args: [Arguments.User, String], admin: true, usage: "<user:user|snowflake> <messageid:string>", description: commandDescriptions.deletedirectmessage })
  async deletedirectmessage(message: Discord.Message, user: Discord.User, messageId: string): Promise<void> {
    await message.delete();
    const dmchannel = await user.createDM();
    const channel = await this.client.channels.fetch(env.CHANNELS.DIRECT_MESSAGE_LOG) as Discord.TextChannel;
    const dmMessage = await dmchannel.messages.fetch(messageId);
    if (!dmMessage) return;

    await dmMessage.delete();
    const embed = new Embed()
      .setTimestamp()
      .setColor(colors.DM_DELETED_MESSAGE)
      .setAuthor(`${dmMessage.author.tag} (${dmMessage.author.id})`, dmMessage.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setFooter(strings.modules.directmessages.embedFooter(dmMessage.id))
      .setDescription(dmMessage.content);
    channel.send(strings.modules.directmessages.commands.directMessageDeleteExecution(message, user), embed);
    message.channel.send(strings.general.success(strings.modules.directmessages.commands.directMessageDeleted(user, dmMessage.content)));
  }
}