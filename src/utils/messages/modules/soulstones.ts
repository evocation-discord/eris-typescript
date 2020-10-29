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
      claim: (author: Discord.User, amount: number) => `**${author.username}**#${author.discriminator} collected **${amount}** ${emotes.commandresponses.soulstones}.`
    },
    leaderboard: {
      header: `${emotes.commandresponses.soulstones} **SOULSTONE LEADERBOARD**\n`,
      row: (rank: number, user: Discord.User, soulstones: number) => `${messages.general.rankEmoji(rank)}**${rank}**. ${user} (\`${user.id}\`) » **\`${soulstones}\` SOULSTONES**`
    },
    redeeminducements: {
      success: `${emotes.commandresponses.soulstones} **INDUCEMENTS REDEEMED**: You have redeemed **25** Soulstones. You can run this command again in **6 hours**.`
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
    },
    deletesshopitem: (itemName: string) => `Removed shop item with name **${itemName.toUpperCase()}**. Users will no longer be able to purchase this item.`,
    addsshopitem: (itemName: string) => `Added shop item with name **${itemName.toUpperCase()}**. Applied specified properties, if any.`,
    resetsoulstones: {
      response: `${emotes.commandresponses.soulstones} **SOULSTONE MANAGEMENT**: I have reset the Soulstone balance of the specified users.`,
      log: (user: Discord.User, moderator: Discord.User, amount: number) => `${emotes.commandresponses.soulstones} **SOULSTONES RESET**: Bot maintainer **\`${moderator.tag}\`** (\`${moderator.id}\`) reset the Soulstones of **\`${user.tag}\`** (\`${user.id}\`). They had **${amount}** Soulstones.`
    },
    soulstoneshop: {
      title: `${emotes.commandresponses.soulstones} Soulstone Shop`,
      keyItem: (item: SoulstoneShopItem) => `You will get the **${item.data.toUpperCase()}** item.${typeof item.buyableAmount === "number" ? ` This item is limited; **${item.buyableAmount}** left.` : ""}`,
      roleItem: (item: SoulstoneShopItem) => `You will get the **<@&${item.data}>** role.${typeof item.buyableAmount === "number" ? ` This item is limited; **${item.buyableAmount}** left.` : ""}`
    },
    addsquantity: {
      succes: (whatToDo: string, item: SoulstoneShopItem) => `Added **${whatToDo}** availability points to the quantity of item **${item.type === "role" ? `<@&${item.data}>` : item.data.toUpperCase()}**.`
    },
    sscommonality: {
      update: (oldValue: number, newValue: number) => `${emotes.commandresponses.soulstones} **COMMONALITY MANAGEMENT**: Soulstone currency generation commonality updated from **${oldValue}** to **${newValue}**.`,
      info: (value: number) => `${emotes.commandresponses.soulstones} **COMMONALITY MANAGEMENT**: Soulstone currency generation commonality is **${value}**.`
    },
    ssrate: {
      update: (oldValue: string, newValue: string) => `${emotes.commandresponses.soulstones} **EMERGENCE MANAGEMENT**: The rate of emergence is now ${newValue}, where it was previously ${oldValue}.`,
      info: (value: string) => `${emotes.commandresponses.soulstones} **EMERGENCE MANAGEMENT**: The rate of emergence is ${value}.`
    },
    sscooldown: {
      update: (oldValue: number, newValue: number) => `${emotes.commandresponses.soulstones} **COOLDOWN MANAGEMENT**: The new cooldown for Soulstone currency generation is **${newValue}**, where it was previously **${oldValue}**.`,
      info: (value: number) => `${emotes.commandresponses.soulstones} **COOLDOWN MANAGEMENT**: The cooldown for Soulstone currency generation is **${value}**.`
    },
    itemDoesNotExist: "This item does not exist."
  }
};
