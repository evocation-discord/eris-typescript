/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Discord from "discord.js";
import { emotes, env } from "@utils/constants";
import { SoulstoneShopItem } from "@utils/database/models";
import messages from "..";

export default {
  generationMessage: (soulstones: number, code: string) => `**${soulstones}** ${emotes.commandresponses.soulstones} have emerged. Type \`${process.env.PREFIX}collect ${code}\` to have them bound to you.`,
  commands: {
    gc: {
      enabled: (channel: Discord.TextChannel) => `Enabled currency generation in ${channel}.`,
      disabled: (channel: Discord.TextChannel) => `Disabled currency generation in ${channel}.`
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
      log: (maintainer: Discord.User, user: Discord.User, award: number) => `${emotes.commandresponses.soulstones} **SOULSTONES AWARDED**: Bot maintainer **\`${maintainer.tag}\`** (\`${maintainer.id}\`) awarded **${award}** Soulstones to **\`${user.tag}\`** (\`${user.id}\`).`,
      success: (user: Discord.User, award: number, total: number) => `${emotes.commandresponses.soulstones} **SOULSTONE MANAGEMENT**: Awarded **${award}** Soulstones to **\`${user.tag}\`** (\`${user.id}\`). They now have **${total}** Soulstones.`
    },
    deductsoulstones: {
      success: (user: Discord.User, deduct: number, total: number) => `${emotes.commandresponses.soulstones} **SOULSTONE MANAGEMENT**: Deducted **${deduct}** Soulstones from **\`${user.tag}\`** (\`${user.id}\`). They now have **${total}** Soulstones.`,
      error: "User does not have that many Soulstones.",
      log: (maintainer: Discord.User, user: Discord.User, deduct: number) => `${emotes.commandresponses.soulstones} **SOULSTONES DEDUCTED**: Bot maintainer **\`${maintainer.tag}\`** (\`${maintainer.id}\`) deducted **${deduct}** Soulstones from **\`${user.tag}\`** (\`${user.id}\`).`
    },
    buy: {
      item: {
        log: (buyer: Discord.User, item: SoulstoneShopItem) => `${emotes.commandresponses.soulstones} **TRANSACTION PROCESSED**: **\`${buyer.tag}\`** (\`${buyer.id}\`) purchased item **${item.data.toUpperCase()}**. They have had **${item.cost}** Soulstones deducted from their total balance. Please deliver this prize to them as soon as possible. **<@&${env.ROLES.ADMINISTRATORS}>**`,
        purchase: (item: SoulstoneShopItem) => `${emotes.commandresponses.soulstones} **TRANSACTION PROCESSED**: You have purchased the **${item.data.toUpperCase()}** item. Administrators have been mentioned in a private channel to notify them of this transaction. Please wait patiently, we will contact you through Hexyte.`
      },
      role: {
        auditReasonAdd: "Role purchased through Soulstone Shop.",
        auditReasonRemove: "User ranked up to the next role.",
        purchase: (role: Discord.Role) => `${emotes.commandresponses.soulstones} **TRANSACTION PROCESSED**: You are now **${role.name.toUpperCase()}**.`,
        youNeedChronosFirst: `${emotes.commandresponses.soulstones} **TRANSACTION FAILED**: You need **CHRONOS** first.`,
        alreadyHasThatRole: `${emotes.commandresponses.soulstones} **TRANSACTION FAILED**: You already have this role. Please contact an administrator if you believe this is in error.`,
        alreadyhasRoleAboveThatRole: (role: Discord.Role) => `${emotes.commandresponses.soulstones} **TRANSACTION FAILED**: You have already ascended **${role.name.toUpperCase()}**.`,
        cantBuyRoleThatIsNotDirectlyAboveTheirRole: (triedRole: Discord.Role, roleTheyNeedFirst: Discord.Role) => `${emotes.commandresponses.soulstones} **TRANSACTION FAILED**: Sorry, you cannot purchase **${triedRole.name.toUpperCase()}** as you need to have **${roleTheyNeedFirst.name.toUpperCase()}** first.`
      },
      notEnoughSoulstones: (amountNeeded: number) => `${emotes.commandresponses.soulstones} **INSUFFICIENT FUNDS**: You do not have enough Soulstones to purchase this item or role. You require **${amountNeeded}** more Soulstones.`,
      notBuyableAnymore: `${emotes.commandresponses.soulstones} **TRANSACTION FAILED**: This item is no longer purchasable. Please contact an administrator if you believe this is in error.`
    }
  }
};
