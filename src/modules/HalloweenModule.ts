import { env } from "@utils/constants";
import { Module } from "@utils/modules";
import { monitor } from "@utils/monitor";
import Discord from "discord.js";

const kittyEmojiId = "762242961483890709";
const kittyEmoji = `<:ghostkitty:${kittyEmojiId}>`;

const halloweenChannel = process.env.HALLOWEEN_CHANNEL;

export default class HalloweenModule extends Module {

  @monitor({ event: "message" })
  async onMessage(message: Discord.Message): Promise<void|Discord.Message> {
    const mainGuild = message.client.guilds.resolve(env.MAIN_GUILD_ID);
    if (message.channel.id !== halloweenChannel) return;
    if (mainGuild.members.resolve(message.author.id).roles.cache.some(role => [env.ROLES.ADMINISTRATORS, env.ROLES.LEAD_ADMINISTRATORS].includes(role.id))) return undefined;
    const channelMessages = await message.channel.messages.fetch({});
    if (channelMessages.filter(m => m.author.id === message.author.id).size > 1) return message.delete();
    if (message.attachments.size > 0) {
      if (message.attachments.size > 1) return message.delete();
      if (!this.checkifImage(message.attachments.first())) return message.delete();
    }
    await message.react(kittyEmojiId);
  }

  checkifImage(attachment: Discord.MessageAttachment): boolean {
    const url = attachment.url;
    if (url.indexOf("png", url.length - 3) !== -1) return true;
    if (url.indexOf("jpg", url.length - 3) !== -1) return true;
    if (url.indexOf("jpeg", url.length - 4) !== -1) return true;
    return false;
  }

  @monitor({ event: "messageReactionAdd" })
  async messageReactionAdd(reaction: Discord.MessageReaction, user: Discord.User): Promise<void|Discord.MessageReaction> {
    await reaction.message.fetch();
    if (reaction.message.channel.id !== halloweenChannel) return;
    if (reaction.message.author.id === user.id) return reaction.users.remove(user);
  }

}
