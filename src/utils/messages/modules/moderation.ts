/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { emotes } from "@utils/constants";
import { Blacklist } from "@utils/database/models";
import { timeFormatter } from "@utils/time";
import Discord from "discord.js";

export default {
  exclusions: {
    cantAddRoleToExclusions: "You cannot add that role as an exclusion as it would constitute your exclusion, too.",
    cantExcludeBots: "You cannot exclude bot users. Please remember that Eris automatically ignores all other bots, webhooks and herself.",
    cantExcludeYourself: "You cannot execute that command on yourself.",
    executedExclusions: (type: "role" | "user") => `Executed exclusions for the specified ${type}.`,
    exclusionEmbedName: (type: "Role" | "User") => `${type} Exclusions`,
    noUsersExcluded: "→ No users excluded.",
    noRolesExcluded: "→ No roles excluded.",
    exclusionMapping: (ur: Blacklist) => `→ <@${ur.type === "role" ? "&" : ""}${ur.id}> (\`${ur.id}\`)`,
    roleNotExcluded: "This role is not excluded.",
    userNotExcluded: "This user is not excluded.",
    updatedExclusionsForRole: "Updated exclusions for the specified role.",
    updatedExclusionsForUser: "Updated exclusions for the specified user.",
    removedAllExclusions: "Removed all exclusions."
  },
  logging: {
    anonymisedAudit: (cmdTrigger: string) => `\`[${timeFormatter()}]\` **\`[ANONYMISED]\`** ${emotes.logging.anonymisedaudit} Command \`${cmdTrigger}\` was performed. No further information is available.`,
    administrativeCommand: (msg: Discord.Message, cmdTrigger: string, stringArgs: string[]) => `\`[${timeFormatter()}]\` **\`[ADMINISTRATIVE]\`** ${emotes.logging.administrativeaudit} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`,
    command: (msg: Discord.Message, cmdTrigger: string, stringArgs: string[]) => `\`[${timeFormatter()}]\` ${emotes.logging.audit} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`,
    disabledCommand: (msg: Discord.Message, cmdTrigger: string, stringArgs: string[]) => `\`[${timeFormatter()}]\` ${emotes.logging.audit} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed a disabled command \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`,
    linkResolver: (msg: Discord.Message, link: string, resLink: string) => [
      `\`[${timeFormatter()}]\` **\`[LINK REDIRECT RESOLVER]\`** ${emotes.logging.linkresolver} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) sent a message (\`${msg.id}\`) containing a redirection-based link in ${msg.channel} (\`${msg.channel.id}\`).\n`,
      `**UNRESOLVED LINK**: <${link}>`,
      `**RESOLVED LINK**: <${resLink}>\n`,
      "No automatic action has been taken against their account or the message itself. Please review the above to ensure that the link is not violative of Evocation's regulations."
    ].join("\n"),
    userUpdate: (oldUser: Discord.User, newUser: Discord.User) => `\`[${timeFormatter()}]\` ${emotes.logging.nameupdate} User with ID \`${newUser.id}\` (${newUser}>) has changed their Discord username: \`**[${oldUser.username}]**\` → \`**[${newUser.username}]**\`.`,
    userBoost: (user: Discord.User) => [
      `Thank you for boosting **EVOCATION**, ${user}! You now have access to change your own nickname, embed links, attach files and stream into the server. If these permissions seem familiar to you, that means you are **LEVEL 3** or above.\n`,
      "**SUCCESSFULLY UNLOCKED**:",
      `${emotes.commandresponses.soulstones} Coloured **EOS** Role [HOISTED]`,
      `${emotes.commandresponses.soulstones} Permanent x**2 EXPERIENCE MULTIPLIER**`,
      `${emotes.commandresponses.soulstones} Permanent Access to Voice Context Channel`,
      `${emotes.commandresponses.soulstones} Permanent Appearance in Server Leaderboard`,
      `${emotes.commandresponses.soulstones} Special Badge Appended to Your Entry in Server Leaderboard`,
      `${emotes.commandresponses.soulstones} **\`e!vb\`** Command Access [COMING SOON]`,
      `${emotes.commandresponses.soulstones} **\`e!muse\`** Command Access`
    ].join("\n"),
    hyacinthRoleRemoval: "[CONDITIONAL REVOCATION] User has a levelled role."
  },
  permissions: {
    negations: (type: "Reaction" | "Art" | "Media" | "Experience" | "Feedback" | "Events") => `${type} negations have been executed for the specified users.`
  },
  quote: {
    embedAuthor: (msg: Discord.Message) => `${msg.author.tag} (${msg.author.id})`,
    embedFooter: (msgId: string, channelName: string) => `Message ID: ${msgId} | Sent in #${channelName}`,
    unknownError: "Cannot quote this message; do I have permission to view the channel in which this message originates?",
    restrictedChannel: "You cannot quote a message from that channel as its access is highly restricted.",
    bot: "You cannot quote bots."
  }
};
