import { monitor, Module, ErisClient, CHANNELS, emotes, MAIN_GUILD_ID } from "@lib/utils";
import { GuildEmoji, TextChannel } from "discord.js";

export default class EmojiModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @monitor({ events: ["emojiCreate"] })
  async emojiCreate(emoji: GuildEmoji): Promise<void> {
    if (emoji.guild.id !== MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(CHANNELS.PERIPHERAL_ANNOUNCEMENTS) as TextChannel;
    channel.send(`${this.client.emojis.cache.get(emotes.UNCATEGORISED.ENTER)} **EMOJI ADDED**: ${emoji} \`:${emoji.name}:\``);
  }

  @monitor({ events: ["emojiUpdate"] })
  async emojiUpdate(oldEmoji: GuildEmoji, newEmoji: GuildEmoji): Promise<void> {
    if (newEmoji.guild.id !== MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(CHANNELS.PERIPHERAL_ANNOUNCEMENTS) as TextChannel;
    channel.send(`${this.client.emojis.cache.get(emotes.UNCATEGORISED.ENTER)} **EMOJI RENAMED**: ${newEmoji} \`:${oldEmoji.name}:\` → \`:${newEmoji.name}:\``);
  }

  @monitor({ events: ["emojiDelete"] })
  async emojiDelete(emoji: GuildEmoji): Promise<void> {
    if (emoji.guild.id !== MAIN_GUILD_ID) return;
    const channel = await this.client.channels.fetch(CHANNELS.PERIPHERAL_ANNOUNCEMENTS) as TextChannel;
    channel.send(`${this.client.emojis.cache.get(emotes.UNCATEGORISED.LEAVE)} **EMOJI REMOVED**: \`:${emoji.name}:\``);
  }
}