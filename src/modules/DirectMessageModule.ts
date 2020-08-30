import { Module, monitor, command, inhibitors, Remainder, colors, emotes, CHANNELS } from "@lib/utils";
import { Message, TextChannel, MessageEmbed, User } from "discord.js";
import { strings } from "@lib/utils/messages";

export default class DirectMessageModule extends Module {

  @monitor({ event: "message" })
  async DM_receiver(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (message.partial) message = await message.fetch();
    if (message.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(CHANNELS.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setColor(colors.DM_SEND_MESSAGE)
      .setFooter(strings.modules.directmessages.embedFooter(message.id))
      .setAuthor(strings.modules.directmessages.embedAuthor(message), message.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(message.content);
    if (message.attachments.size > 0) embed.addField(strings.modules.directmessages.attachments, message.attachments.map(attachment => attachment.url).join("\n"));
    channel.send(strings.modules.directmessages.directMessageReceived, embed);
  }

  @monitor({ event: "messageUpdate" })
  async DM_receiver_on_edit(oldMsg: Message, newMsg: Message): Promise<void> {
    if (newMsg.partial) newMsg = await newMsg.fetch();
    if (newMsg.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(CHANNELS.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
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
  async DM_receiver_on_delete(msg: Message): Promise<void> {
    if (msg.partial) return;
    if (msg.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(CHANNELS.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setColor(colors.DM_DELETED_MESSAGE)
      .setFooter(strings.modules.directmessages.embedFooter(msg.id))
      .setAuthor(strings.modules.directmessages.embedAuthor(msg), msg.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(msg.content);
    if (msg.attachments.size > 0) embed.addField(strings.modules.directmessages.attachments, msg.attachments.map(attachment => attachment.proxyURL).join("\n"));
    channel.send(strings.modules.directmessages.directMessageDeleted, embed);
  }

  @command({ aliases: ["dm"], group: "Bot Owner", inhibitors: [inhibitors.botAdminsOnly], args: [User, new Remainder(String)], admin: true, usage: "<user:user|snowflake> <content:...string>" })
  async directmessage(message: Message, user: User, content: string): Promise<void> {
    await message.delete();
    const msg = await user.send(content);
    const channel = await this.client.channels.fetch(CHANNELS.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setColor(colors.DM_SEND_MESSAGE)
      .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setFooter(strings.modules.directmessages.embedFooter(msg.id))
      .setDescription(msg.content);
    channel.send(strings.modules.directmessages.commands.directMessageSentExecution(message, user), embed);
    message.channel.send(strings.general.success(strings.modules.directmessages.commands.directMessageSent(user, msg.content)));
  }
  @command({ aliases: ["deletedm"], group: "Bot Owner", inhibitors: [inhibitors.botAdminsOnly], args: [User, String], admin: true, usage: "<user:user|snowflake> <messageid:string>" })
  async deletedirectmessage(message: Message, user: User, messageId: string): Promise<void> {
    await message.delete();
    const dmchannel = await user.createDM();
    const channel = await this.client.channels.fetch(CHANNELS.DIRECT_MESSAGE_LOG) as TextChannel;
    const dmMessage = await dmchannel.messages.fetch(messageId);
    // TODO
    if (!dmMessage) return;

    await dmMessage.delete();
    const embed = new MessageEmbed()
      .setTimestamp()
      .setColor(colors.DM_SEND_MESSAGE)
      .setAuthor(`${dmMessage.author.tag} (${dmMessage.author.id})`, dmMessage.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setFooter(strings.modules.directmessages.embedFooter(dmMessage.id))
      .setDescription(dmMessage.content);
    channel.send(strings.modules.directmessages.commands.directMessageDeleteExecution(message, user), embed);
    message.channel.send(strings.general.success(strings.modules.directmessages.commands.directMessageDeleted(user, dmMessage.content)));
  }
}