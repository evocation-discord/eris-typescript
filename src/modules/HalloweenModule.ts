import { monitor, Module } from "@lib/utils";
import { Message, MessageAttachment, User, MessageReaction } from "discord.js";

const kittyEmojiId = "762242961483890709";
const kittyEmoji = `<:ghostkitty:${kittyEmojiId}>`;

const halloweenChannel = process.env.HALLOWEEN_CHANNEL;

export default class HalloweenModule extends Module {

  @monitor({ event: "message" })
  async onMessage(message: Message): Promise<void|Message> {
    if (message.channel.id !== halloweenChannel) return;
    const channelMessages = await message.channel.messages.fetch({});
    if (channelMessages.filter(m => m.author.id === message.author.id).size > 1) return message.delete();
    if (message.attachments.size > 0) {
      if (message.attachments.size > 1) return message.delete();
      if (!this.checkifImage(message.attachments.first())) return message.delete();
    }
    await message.react(kittyEmojiId);
  }

  checkifImage(attachment: MessageAttachment): boolean {
    const url = attachment.url;
    if (url.indexOf("png", url.length - 3) !== -1) return true;
    if (url.indexOf("jpg", url.length - 3) !== -1) return true;
    if (url.indexOf("jpeg", url.length - 4) !== -1) return true;
    return false;
  }

  @monitor({ event: "messageReactionAdd" })
  async messageReactionAdd(reaction: MessageReaction, user: User): Promise<void|MessageReaction> {
    await reaction.message.fetch();
    if (reaction.message.channel.id !== halloweenChannel) return;
    if (reaction.message.author.id === user.id) return reaction.users.remove(user);
  }

}