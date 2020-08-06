import { Module, monitor } from "@lib/utils";
import { Message, TextChannel, MessageEmbed } from "discord.js";

export default class DirectMessageModule extends Module {

  @monitor()
  async DM_receiver(message: Message): Promise<void> {
    if (message.channel.type !== "dm") return;
    const channel = await this.client.channels.fetch(process.env.DIRECT_MESSAGE_LOG) as TextChannel;
    const embed = new MessageEmbed()
      .setTimestamp()
      .setFooter(`Message ID: ${message.id}`)
      .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ dynamic: true, format: "png" }))
      .setDescription(`${message.content}${message.attachments.size > 0 ? `\n\n__Attachments__\n${message.attachments.map(attachment => attachment.url).join("\n")}` : ""}`);
    channel.send(`**${this.client.emojis.resolve("737208433672978544")} DIRECT MESSAGE RECEIVED**`, embed);
  }
}