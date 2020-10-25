/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Discord from "discord.js";
import { emotes } from "@utils/constants";
import messages from "..";

export default {
  generationMessage: (soulstones: number, code: string) => `**${soulstones}** ${emotes.commandresponses.soulstones} have emerged. Type \`${process.env.PREFIX}collect ${code}\` to have them bound to you.`,
  commands: {
    gc: {
      enabled: (channel: Discord.TextChannel) => `Enabled currencry generation in ${channel}.`,
      disabled: (channel: Discord.TextChannel) => `Disabled currencry generation in ${channel}.`
    },
    collect: {
      claim: (author: Discord.User, amount: number) => `**${author.tag}** collected **${amount}** ${emotes.commandresponses.soulstones}.`
    },
    leaderboard: {
      header: `${emotes.commandresponses.soulstones} **SOULSTONE LEADERBOARD**\n`,
      row: (rank: number, user: Discord.User, soulstones: number) => `${messages.general.rankEmoji(rank)}**${rank}**. ${user} (\`${user.id}\`) » **\`${soulstones}\` SOULSTONES**`
    },
    redeeminducements: {
      success: "You have redeemed **25** Soulstones."
    },
    soulstones: {
      success: (user: Discord.User, soulstones: number) => `${emotes.commandresponses.soulstones} **BALANCE**: **${user.username}**#${user.discriminator} has **${soulstones}** Soulstone(s).`
    },
    awardsoulstones: {
      success: (user: Discord.User, award: number, total: number) => `${emotes.commandresponses.soulstones} **SOULSTONE MANAGEMENT**: Awarded **${award}** Soulstones to **\`${user.tag}\`** (\`${user.id}\`). They now have **${total}** Soulstones.`
    },
    deductsoulstones: {
      success: (user: Discord.User, deduct: number, total: number) => `${emotes.commandresponses.soulstones} **SOULSTONE MANAGEMENT**: Deducted **${deduct}** Soulstones from **\`${user.tag}\`** (\`${user.id}\`). They now have **${total}** Soulstones.`,
      error: "User does not have that many Soulstones."
    }
  }
};
