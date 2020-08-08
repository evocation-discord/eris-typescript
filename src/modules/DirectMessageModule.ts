import { Module, monitor, command, inhibitors, Remainder } from "@lib/utils";
import { Message, TextChannel, MessageEmbed, User } from "discord.js";

export default class DirectMessageModule extends Module {

  @monitor({ events: ["message"] })
  async DM_receiver(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (message.partial) message = await message.fetch();
    if (message.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(process.env.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setFooter(`Message ID: ${message.id}`)
      .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(`${message.content}${message.attachments.size > 0 ? `\n\n__Attachments__\n${message.attachments.map(attachment => attachment.url).join("\n")}` : ""}`);
    channel.send(`**${this.client.emojis.resolve("737208433672978544")} DIRECT MESSAGE RECEIVED**`, embed);
  }

  @monitor({ events: ["messageUpdate"] })
  async DM_receiver_on_edit(oldMsg: Message, newMsg: Message): Promise<void> {
    if (newMsg.partial) newMsg = await newMsg.fetch();
    if (newMsg.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(process.env.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setFooter(`Message ID: ${newMsg.id}`)
      .setAuthor(`${newMsg.author.tag} (${newMsg.author.id})`, newMsg.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(`${newMsg.attachments.size > 0 ? `\n\n__Attachments__\n${newMsg.attachments.map(attachment => attachment.url).join("\n")}` : ""}`)
      .addField("Original Message", oldMsg.content || "Old Message content couldn't be fetched")
      .addField("Edited Message", newMsg.content);
    channel.send(`**${this.client.emojis.resolve("737207518727503912")} DIRECT MESSAGE EDITED**`, embed);
  }

  @monitor({ events: ["messageDelete"] })
  async DM_receiver_on_delete(msg: Message): Promise<void> {
    if (msg.partial) return;
    if (msg.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(process.env.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setFooter(`Message ID: ${msg.id}`)
      .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(`${msg.attachments.size > 0 ? `\n\n__Attachments__\n${msg.attachments.map(attachment => attachment.proxyURL).join("\n")}` : ""}`)
      .addField("Message", msg.content);
    channel.send(`**${this.client.emojis.resolve("737019540373766224")} DIRECT MESSAGE DELETED**`, embed);
  }

  @command({ aliases: ["dm"], inhibitors: [inhibitors.botAdminsOnly], args: [User, new Remainder(String)] })
  async directmessage(message: Message, user: User, content: string): Promise<void> {
    const msg = await user.send(content);
    const channel = await this.client.channels.fetch(process.env.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setFooter(`Message ID: ${msg.id}`)
      .addField("Contents", msg.content);
    channel.send(`**\`${message.author.tag}\`** (\`${message.author.id}\`) ran an administrative command, forcing me to send a Direct Message to **\`${user.tag}\`** (\`${user.id}\`).`, embed);
  }
}