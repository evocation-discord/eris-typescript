/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { emotes } from "@utils/constants";
import { timeFormatter } from "@utils/time";
import Discord from "discord.js";

export default {
  announcementMessages: (message: Discord.Message) => `\`[${timeFormatter(new Date(message.createdTimestamp))}]\` **\`[PUBLICATION NOTICE]\`** <:information:747497420954534050> **\`${message.author.tag}\`** (\`${message.author.id}\`) sent a message (\`${message.id}\`) in ${message.channel} (\`${message.channel.id}\`) that was automatically published. **MESSAGE LINK**: <https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}>`,
  emojiAdded: (emoji: Discord.GuildEmoji) => `\`[${timeFormatter()}]\` ${emotes.logging.emojis.addemoji} **EMOJI ADDED**: ${emoji} \`:${emoji.name}:\``,
  emojiUpdated: (oldEmoji: Discord.GuildEmoji, newEmoji: Discord.GuildEmoji) => `\`[${timeFormatter()}]\` ${emotes.logging.emojis.updateemoji} **EMOJI RENAMED**: ${newEmoji} \`:${oldEmoji.name}:\` → \`:${newEmoji.name}:\``,
  emojiDeleted: (emoji: Discord.GuildEmoji) => `\`[${timeFormatter()}]\` ${emotes.logging.emojis.deleteemoji} **EMOJI REMOVED**: \`:${emoji.name}:\``,
  animatedEmojiAdded: (emoji: Discord.GuildEmoji) => `\`[${timeFormatter()}]\` ${emotes.logging.emojis.addemoji} **ANIMATED EMOJI ADDED**: ${emoji} \`:${emoji.name}:\``,
  animatedEmojiUpdated: (oldEmoji: Discord.GuildEmoji, newEmoji: Discord.GuildEmoji) => `\`[${timeFormatter()}]\` ${emotes.logging.emojis.updateemoji} **ANIMATED EMOJI RENAMED**: ${newEmoji} \`:${oldEmoji.name}:\` → \`:${newEmoji.name}:\``,
  animatedEmojiDeleted: (emoji: Discord.GuildEmoji) => `\`[${timeFormatter()}]\` ${emotes.logging.emojis.deleteemoji} **ANIMATED EMOJI REMOVED**: \`:${emoji.name}:\``
};
