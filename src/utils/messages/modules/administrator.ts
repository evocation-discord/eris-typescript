/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { emotes, env } from "@utils/constants";
import { timeFormatter } from "@utils/time";
import { Giveaway } from "@utils/database/models";
import Discord from "discord.js";

export default {
  directmessages: {
    embedFooter: (messageid: Discord.Snowflake) => `Message ID: ${messageid}`,
    embedAuthor: (message: Discord.Message) => `${message.author.tag} (${message.author.id})`,
    attachments: "Attachments",
    directMessageReceived: `${emotes.logging.messagecreation} **DIRECT MESSAGE RECEIVED**`,
    directMessageEdited: `${emotes.logging.messageedit} **DIRECT MESSAGE EDITED**`,
    directMessageDeleted: `${emotes.logging.messagedeletion} **DIRECT MESSAGE DELETED**`,
    originalMessage: "Original Message",
    orignalContentError: "Old Message content couldn't be fetched.",
    editedMessage: "Edited Message",
    commands: {
      directMessageSentExecution: (message: Discord.Message, user: Discord.User) => `${emotes.logging.messagecreation} **\`${message.author.tag}\`** (\`${message.author.id}\`) ran an administrative command in ${message.channel} (\`${message.channel.id}\`), forcing me to send a Direct Message to **\`${user.tag}\`** (\`${user.id}\`).`,
      directMessageDeleteExecution: (message: Discord.Message, user: Discord.User) => `${emotes.logging.messagedeletion} **\`${message.author.tag}\`** (\`${message.author.id}\`) ran an administrative command in ${message.channel} (\`${message.channel.id}\`), forcing me to delete a Direct Message that was previously sent to **\`${user.tag}\`** (\`${user.id}\`).`,
      directMessageSent: (user: Discord.User, content: string) => `Direct Message has been sent to **\`${user.tag}\`** (\`${user.id}\`) - **${content}**.`,
      directMessageDeleted: (user: Discord.User, content: string) => `Direct Message to **\`${user.tag}\`** (\`${user.id}\`) has been deleted - **${content}**.`
    }
  },
  donations: {
    auditLogDonationRoleAdd: "[FORCED REVOCATION] Authenticity cannot be verified.",
    commands: {
      logdonationBotError: "The identifier you inputted is attributed to that of a bot. Please only use this command for its intended purpose.",
      logdonationAlreadyHyperion: (user: Discord.User) => `I have logged this donation; ${user} already has the **<@&${env.ROLES.HYPERION}>** role.`,
      logdonationNewHyperion: (user: Discord.User) => `I have logged this donation and awarded ${user} with the **<@&${env.ROLES.HYPERION}>** role.`,
      awardMiraculum: (user: Discord.User) => `I have awarded ${user} with the **<@&${env.ROLES.EVOCATION_MIRACULUM}>** role. Please take into consideration that this message will be returned even if the user already has the role prior to the command invocation being sent.`,
      logdonationLogEntry: (user: Discord.User, item: string, executor: Discord.User) => `\`[${timeFormatter()}]\` ${emotes.giveaway.donation} **\`${user.tag}\`** (\`${user.id}\`) donated **${item}**. This donation was logged by **\`${executor.tag}\`** (\`${executor.id}\`).`
    }
  },
  giveaways: {
    embed: {
      footerEnded: (winnerAmount: number) => `${winnerAmount} Winner(s) | Ended`,
      footer: (winnerAmount: number) => `${winnerAmount} Winner(s) | Ends`,
      noWinner: `${emotes.commandresponses.denial} **EXECUTION FAILURE**: A winner was not able to be determined.`,
      giveawayEndedHeader: `${emotes.giveaway.giftmessage} **GIVEAWAY ENDED** ${emotes.giveaway.giftmessage}`,
      giveawayHeader: `${emotes.giveaway.giftmessage} **GIVEAWAY** ${emotes.giveaway.giftmessage}`,
      winners: (winners: string) => [
        "This giveaway was won by:",
        winners,
        "\nIf there are any complications in the delivery of the prize or an illegitimacy was identified, this prize may be rerolled."
      ].join("\n"),
      description: (duration: string) => [
        `React with ${emotes.giveaway.giftreaction} to enter!\n`,
        `**TIME REMAINING**: ${duration}\n`,
        `**ELIGIBILITY PREREQUISITES**: You __**MUST**__ have the **<@&${env.ROLES.MALLORN}>** role or above to enter giveaways. If you attempt to enter this giveaway without being **LEVEL 3** or above, your entrance will be nullified.\n`,
        "Want to receive notifications everytime a giveaway is active? Run `hjoin Giveaways` in <#528598988673253376>."
      ].join("\n")
    },
    noWinner: (name: string) => `Nobody won **${name}**. Maybe next time...`,
    winners: (winners: string, name: string, messageLink: string) => `Congratulations ${winners}! You have won **${name}**. Please send a Direct Message to <@747105315840983212> with this message link to redeem your prize: <${messageLink}>. If we do not hear from you within **24** hours of this message being sent, the prize will be rerolled.`,
    loadingMessage: "Loading...",
    notValidMessageID: "That is not a valid message ID! Try running without an ID to use the most recent giveaway in this channel.",
    giveawayEnded: "Giveaway has been ended.",
    noGiveawayMessageLinked: "The message you linked is not a giveaway message!",
    rerollNewWinner: (name: string, winner: Discord.User, messageLink: string) => [
      `The new winner of **${name}** is ${winner}.`,
      `**MESSAGE LINK**: <${messageLink}>`
    ].join("\n"),
    noRecentGiveawaysFound: "I couldn't find any recent giveaways in this channel.",
    giveawayAlreadyEnded: "Giveaway has already ended.",
    mostRecentGiveawayAlreadyEnded: "The most recent giveaway in this channel has already ended.",
    noCurrentActiveGiveaway: "There are currently no active giveaways on the server.",
    giveawayListMap: (index: number, giveaway: Giveaway) => `\`${index + 1}.\` **\`[CREATION]\`** \`[${timeFormatter(giveaway.startTime)}]\` **${giveaway.prize}** in <#${giveaway.channelId}> (\`${giveaway.channelId}\`). Started by **<@${giveaway.startedBy}>** (\`${giveaway.startedBy}\`). Ends at \`${timeFormatter(giveaway.endTime)}\`. **Message ID**: \`${giveaway.messageId}\``,
    giveawayEndedMap: (index: number, giveaway: Giveaway) => `\`${index + 1}.\` **\`[CREATION]\`** \`[${timeFormatter(giveaway.startTime)}]\` **${giveaway.prize}** in <#${giveaway.channelId}> (\`${giveaway.channelId}\`). Started by **<@${giveaway.startedBy}>** (\`${giveaway.startedBy}\`). Ended at \`${timeFormatter()}\`.`,
    activeGiveaways: `${emotes.giveaway.giftmessage} **ACTIVE GIVEAWAYS**`,
    endedGivewaways: `${emotes.giveaway.giftmessage} **ENDED GIVEAWAYS**`
  },
  rolemanagement: {
    dethrone: {
      auditLogReason: (executor: Discord.User) => `${executor.tag} (${executor.id}) dethroned this user. Check the logs for more information.`,
      success: `${emotes.logging.dethrone} **SUCCESS**: I have removed all roles from the following users. Please note that this action has been logged with information about the command invocation as well as the roles that were removed.`,
      log: (executor: Discord.User, members: { member: Discord.GuildMember, roles: Discord.Role[]}[]) => {
        const strArray = [`\`[${timeFormatter()}]\` ${emotes.logging.dethrone} **${members.length}** member${members.length === 1 ? "" : "s"} was/were dethroned by ${executor} (\`${executor.id}\`).`];
        for (const { member, roles } of members) {
          strArray.push(`${member.user} (\`${member.user.id}\`): ${roles.map((r) => `**${r}**`).join(", ")}`);
        }
        return strArray.join("\n");
      }
    },
    crown: {
      auditLogReason: (executor: Discord.User) => `${executor.tag} (${executor.id}) crowned this user. Check the logs for more information.`,
      success: `${emotes.logging.crown} **SUCCESS**: I have added back all roles to the following users. Please note that this action has been logged with information about the command invocation as well as the roles that were added.`,
      log: (executor: Discord.User, members: { member: Discord.GuildMember, roles: Discord.Role[]}[]) => {
        const strArray = [`\`[${timeFormatter()}]\` ${emotes.logging.crown} **${members.length}** member${members.length === 1 ? "" : "s"} was/were crowned by ${executor} (\`${executor.id}\`).`];
        for (const { member, roles } of members) {
          strArray.push(`${member.user} (\`${member.user.id}\`): ${roles.map((r) => `**${r}**`).join(", ")}`);
        }
        return strArray.join("\n");
      }
    }
  }
};
