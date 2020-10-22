/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  XPExclusion, XPMultiplier
} from "@database/models";
import Discord from "discord.js";
import { emotes } from "@utils/constants";
import { timeFormatter } from "@utils/time";

export default {
  auditlog: {
    roleAdd: "[LEVELLING SYSTEM] User met experience threshold for role advancement.",
    roleRemove: "[LEVELLING SYSTEM] Removing outdated levelled role(s).",
    xpReset: "[LEVELLING SYSTEM] Experience of user has been reset."
  },
  executedExclusions: (type: "role" | "channel" | "category") => `Executed exclusions for the specified ${type}.`,
  exclusionEmbedName: (type: "Role" | "Channel" | "Category") => `${type} Exclusions`,
  noChannelsExcluded: "→ No channels excluded.",
  noRolesExcluded: "→ No roles excluded.",
  noCategoriesExcluded: "→ No categories excluded.",
  exclusionMapping: (ur: XPExclusion) => `→ <${ur.type === "role" ? "@&" : "#"}${ur.id}> (\`${ur.id}\`)`,
  roleNotExcluded: "This role is not excluded.",
  channelNotExcluded: "This channel is not excluded.",
  categoryNotExcluded: "This category is not excluded.",
  updatedExclusionsForRole: "Updated exclusions for the specified role.",
  updatedExclusionsForChannel: "Updated exclusions for the specified channel.",
  updatedExclusionsForCategory: "Updated exclusions for the specified category.",
  resetxp: {
    resetxpsuccessfull: (type: "role" | "user", amount: number, amount2?: number) => `The XP of **${amount}** ${type}(s) ${amount2 ? `(${amount2} users) ` : ""}is set to 0.`,
    serverReset: "You are about to delete all experience data associated with users on the current server. Respond with **yes** to proceed. Do **not** respond or send an unrelated message and this request will be automatically terminated.",
    cancelled: "The request has been terminated."
  },
  xpAdded: (amount: number, users: number) => `Added **${amount}** experience to **${users}** user(s).`,
  xpDeducted: (amount: number, users: number) => `Deducted **${amount}** experience from **${users}** user(s).`,
  levelSet: (user: Discord.User, level: number) => `**\`${user.tag}\`** (\`${user.id}\`) is now **LEVEL ${level}**.`,
  auditLogRoleRemove: "[FORCED ATTRIBUTION] Role was not removed from user with legitimacy.",
  // eslint-disable-next-line no-nested-ternary
  multiplierCreated: (type: string, us: Discord.User | Discord.Role | Discord.Guild | Discord.TextChannel, amount: number, expireDate: Date) => `Type **${type.toUpperCase()}** multiplier created. This will affect ${us instanceof Discord.User ? `**\`${us.tag}\`** (\`${us.id}\`)` : us instanceof Discord.Role ? `**${us}** (\`${us.id}\`)` : us instanceof Discord.TextChannel ? `**${us}** (\`${us.id}\`)` : "the whole server"}. ${us instanceof Discord.Role ? "Users that have this role" : us instanceof Discord.Guild ? `All members of **${us.name.toUpperCase()}**` : us instanceof Discord.TextChannel ? "Users that talk in this channel" : "They"} will receive **${amount}** times as much experience as they usually would. ${expireDate ? `This multiplier is set to expire at **${timeFormatter(expireDate)}**. ` : ""}Run \`${process.env.PREFIX}multiplier list\` to retrieve a list of active multipliers, displayed categorically.`,
  missingUserId: "No user ID can be deduced from your command invocation. Please try again.",
  missingRoleId: "No role ID can be deduced from your command invocation. Please try again.",
  missingChannelId: "No channel ID can be deduced from your command invocation. Please try again.",
  removedMultiplier: "Multiplier(s) exhausted.",
  noMultiplierFound: "It does not appear that this user has an active experience multiplier.",
  multiplierEmbedName: (type: "Server" | "User" | "Role" | "Channel") => `${type} Multipliers`,
  noMultipliers: "There are no active multipliers under this category.",
  multiplierMapping: (ur: XPMultiplier) => {
    if (ur.type === "server") return `→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
    if (ur.type === "user") return `→ **User**: <@${ur.thingID}> (\`${ur.thingID}\`)\n→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
    if (ur.type === "role") return `→ **Role**: **<@&${ur.thingID}>** (\`${ur.thingID}\`)\n→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
    if (ur.type === "channel") return `→ **Channel**: **<#${ur.thingID}>** (\`${ur.thingID}\`)\n→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
    return "Error";
  },
  levelRole: {
    add: (role: Discord.Role, level: number) => `Registered **${role}** as a levelled role. It will be automatically awarded to users at **LEVEL ${level}**.`,
    remove: (role: Discord.Role) => `Removed **${role}** from the levelled roles registry.`,
    edit: (role: Discord.Role, level: number) => `Updated **${role}** to **LEVEL ${level}**.`,
    alreadyRegistered: "This role is already registered as a level role.",
    doesNotExist: "This role is not configured to be awarded upon meeting an experience threshold.",
    noLevelledRoles: "No levelled roles have been configured.",
    levelledRolesEmbedTitle: "Levelled Roles",
    levelledRolesEmbedFooter: "These are the roles that will be automatically awarded to users based on predefined thresholds. Certain restrictions may be in place regarding their attribution/revocation."
  },
  leaderboard: {
    header: `${emotes.commandresponses.leaderboard.leaderboard} **SERVER LEADERBOARD**\n`,
    boosterHeader: `\n${emotes.commandresponses.leaderboard.blobboost} **BOOSTER LEADERBOARD**`,
    row: (rank: number, user: Discord.User, level: number, totalXP: number, booster = false) => `${rankEmoji(rank)}**${rank}**. ${user} (\`${user.id}\`) » **LEVEL \`${level}\`** » **\`${totalXP}\` TOTAL EXPERIENCE** ${booster ? emotes.commandresponses.leaderboard.blobboost : ""}`
  },
  checkmultipliers: {
    userProvided: "The above multipliers have been determined to influence this user's experience gain.",
    noUserProvided: "The above multipliers have been determined to influence your experience gain."
  }
};

const rankEmoji = (rank: number): string => {
  if (rank === 1) return `${emotes.commandresponses.leaderboard.numberone} `;
  if (rank === 2) return `${emotes.commandresponses.leaderboard.numbertwo} `;
  if (rank === 3) return `${emotes.commandresponses.leaderboard.numberthree} `;
  return "       ";
};
