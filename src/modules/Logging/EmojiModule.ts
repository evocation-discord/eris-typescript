import { env } from "@utils/constants";
import strings from "@utils/messages";
import { Module } from "@utils/modules";
import Discord from "discord.js";
import { monitor } from "@utils/monitor";

export default class EmojiModule extends Module {
  @monitor({ event: "emojiCreate" })
  async emojiCreate(emoji: Discord.GuildEmoji): Promise<void> {
    if (emoji.guild.id !== env.MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(env.CHANNELS.EMOJI_LOG) as Discord.TextChannel;
    if (emoji.animated) channel.send(strings.modules.events.animatedEmojiAdded(emoji));
    else channel.send(strings.modules.events.emojiAdded(emoji));
  }

  @monitor({ event: "emojiUpdate" })
  async emojiUpdate(oldEmoji: Discord.GuildEmoji, newEmoji: Discord.GuildEmoji): Promise<void> {
    if (newEmoji.guild.id !== env.MAIN_GUILD_ID) return;
    if (newEmoji.name === oldEmoji.name) return;
    const channel = await this.client.channels.fetch(env.CHANNELS.EMOJI_LOG) as Discord.TextChannel;
    if (newEmoji.animated) channel.send(strings.modules.events.animatedEmojiUpdated(oldEmoji, newEmoji));
    else channel.send(strings.modules.events.emojiUpdated(oldEmoji, newEmoji));
  }

  @monitor({ event: "emojiDelete" })
  async emojiDelete(emoji: Discord.GuildEmoji): Promise<void> {
    if (emoji.guild.id !== env.MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(env.CHANNELS.EMOJI_LOG) as Discord.TextChannel;
    if (emoji.animated) channel.send(strings.modules.events.animatedEmojiDeleted(emoji));
    else channel.send(strings.modules.events.emojiDeleted(emoji));
  }
}
