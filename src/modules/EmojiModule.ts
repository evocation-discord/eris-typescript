import { monitor, Module, ErisClient, CHANNELS, emotes, MAIN_GUILD_ID } from "@lib/utils";
import { GuildEmoji, TextChannel } from "discord.js";
import { strings } from "@lib/utils/messages";

export default class EmojiModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @monitor({ event: "emojiCreate" })
  async emojiCreate(emoji: GuildEmoji): Promise<void> {
    if (emoji.guild.id !== MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(CHANNELS.PERIPHERAL_ANNOUNCEMENTS) as TextChannel;
    channel.send(strings.modules.emojis.emojiAdded(emoji));
  }

  @monitor({ event: "emojiUpdate" })
  async emojiUpdate(oldEmoji: GuildEmoji, newEmoji: GuildEmoji): Promise<void> {
    if (newEmoji.guild.id !== MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(CHANNELS.PERIPHERAL_ANNOUNCEMENTS) as TextChannel;
    channel.send(strings.modules.emojis.emojiUpdated(oldEmoji, newEmoji));
  }

  @monitor({ event: "emojiDelete" })
  async emojiDelete(emoji: GuildEmoji): Promise<void> {
    if (emoji.guild.id !== MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(CHANNELS.PERIPHERAL_ANNOUNCEMENTS) as TextChannel;
    channel.send(strings.modules.emojis.emojiAdded(emoji));
  }
}