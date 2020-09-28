/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { emotes, ROLES, timeFormatter } from "..";
import { PermissionResolvable, Snowflake, Message, User, GuildEmoji, Guild, TextChannel, Role } from "discord.js";
import { Blacklist, Giveaway, DisabledCommand, XPExclusion, XPMultiplier } from "../database/models";
import { GuildMember } from "discord.js";
import { CHANNELS } from "../constants";

export const strings = {
  general: {
    success: (text: string) => `${emotes.commandresponses.success} **SUCCESS**: ${text}`,
    error: (text: string) => `${emotes.commandresponses.denial} **COMMAND INHIBITED**: ${text}`,
    commandSyntax: (text: string) => `Syntactic fallacy detected. **COMMAND SYNTAX**: \`${text}\``,
    somethingWentWrong: "Something went wrong.",
    commandDisabled: "This command has been disabled, hence this denial of access. If you believe this administrative action was in error, please contact a Bot Owner (users who are accredited in `e!about`).",
    version: `${emotes.commandresponses.version} **VERSION**: Eris is currently running on version **1.5**, titled **THE EXPERIENCE UPDATE**, deployed on **12**/**09**/**2020** (DD/MM/YYYY).`,
    commandSyntaxError: (usage: string) => `A syntactic error was encountered. Angle brackets are indicative of required arguments, while square brackets are indicative of optional arguments.\n**SYNTAX**: \`${usage}\``
  },
  giveaway: {
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
        `**ELIGIBILITY PREREQUISITES**: You __**MUST**__ have the **<@&${ROLES.MALLORN}>** role or above to enter giveaways. If you attempt to enter this giveaway without being **LEVEL 3** or above, your entrance will be nullified.\n`,
        "Want to receive notifications everytime a giveaway is active? Run `-ar Giveaway Notifications` in <#528598988673253376>."
      ].join("\n")
    },
    noWinner: (name: string) => `Nobody won **${name}**. Maybe next time...`,
    winners: (winners: string, name: string, messageLink: string) => `Congratulations ${winners}! You have won **${name}**. Please send a Direct Message to <@747105315840983212> with this message link to redeem your prize: <${messageLink}>. If we do not hear from you within **24** hours of this message being sent, the prize will be rerolled.`
  },
  arguments: {
    noArgumentSupplied: "No argument(s) was/were supplied.",
    remainderBlank: "Remainder of the command is blank.",
    invalidDuration: "Invalid duration.",
    invalidNumber: "Could not identify number within syntactic parameters.",
    couldNotFindGuildMember: "Could not find that guild member.",
    couldNotFindUser: "Could not find that user.",
    couldNotFindGuild: "Could not find that guild.",
    couldNotFindTextChannel: "Could not find that text channel.",
    couldNotFindCategory: "Could not find that category.",
    couldNotFindRole: "Could not find that role."
  },
  inhibitors: {
    noPermission: "You do not satisfy the predefined criteria to be able to perform this command.",
    notInGuild: "You are not in a guild.",
    missingDiscordPermission: (permission: PermissionResolvable) => `You do not satisfy a Discord permission node: **${permission}**.`,
    cooldown: (cooldown: string) => `You must wait **${cooldown}** to run this command!`,
    requestRejectedBotCommands: "Request has been rejected. Please run this command in <#528598988673253376>!",
    requestRejected: "Request has been rejected."
  },
  modules: {
    directmessages: {
      embedFooter: (messageid: Snowflake) => `Message ID: ${messageid}`,
      embedAuthor: (message: Message) => `${message.author.tag} (${message.author.id})`,
      attachments: "Attachments",
      directMessageReceived: `${emotes.logging.messagecreation} **DIRECT MESSAGE RECEIVED**`,
      directMessageEdited: `${emotes.logging.messageedit} **DIRECT MESSAGE EDITED**`,
      directMessageDeleted: `${emotes.logging.messagedeletion} **DIRECT MESSAGE DELETED**`,
      originalMessage: "Original Message",
      orignalContentError: "Old Message content couldn't be fetched.",
      editedMessage: "Edited Message",
      commands: {
        directMessageSentExecution: (message: Message, user: User) => `${emotes.logging.messagecreation} **\`${message.author.tag}\`** (\`${message.author.id}\`) ran an administrative command in ${message.channel} (\`${message.channel.id}\`), forcing me to send a Direct Message to **\`${user.tag}\`** (\`${user.id}\`).`,
        directMessageDeleteExecution: (message: Message, user: User) => `${emotes.logging.messagedeletion} **\`${message.author.tag}\`** (\`${message.author.id}\`) ran an administrative command in ${message.channel} (\`${message.channel.id}\`), forcing me to delete a Direct Message that was previously sent to **\`${user.tag}\`** (\`${user.id}\`).`,
        directMessageSent: (user: User, content: string) => `Direct Message has been sent to **\`${user.tag}\`** (\`${user.id}\`) - **${content}**.`,
        directMessageDeleted: (user: User, content: string) => `Direct Message to **\`${user.tag}\`** (\`${user.id}\`) has been deleted - **${content}**.`
      }
    },
    donations: {
      auditLogDonationRoleAdd: "[FORCED REVOCATION] Authenticity cannot be verified.",
      commands: {
        logdonationBotError: "The identifier you inputted is attributed to that of a bot. Please only use this command for its intended purpose.",
        logdonationAlreadyWhiteHallows: (user: User) => `I have logged this donation; ${user} already has the **<@&${ROLES.WHITE_HALLOWS}>** role.`,
        logdonationNewWhiteHallows: (user: User) => `I have logged this donation and awarded ${user} with the **<@&${ROLES.WHITE_HALLOWS}>** role.`,
        awardMiraculum: (user: User) => `I have awarded ${user} with the **<@&${ROLES.EVOCATION_MIRACULUM}>** role. Please take into consideration that this message will be returned even if the user already has the role prior to the command invocation being sent.`,
        logdonationLogEntry: (user: User, item: string, executor: User) => `\`[${timeFormatter()}]\` ${emotes.giveaway.donation} **\`${user.tag}\`** (\`${user.id}\`) donated **${item}**. This donation was logged by **\`${executor.tag}\`** (\`${executor.id}\`).`
      }
    },
    emojis: {
      emojiAdded: (emoji: GuildEmoji) => `${emotes.uncategorised.enter} **EMOJI ADDED**: ${emoji} \`:${emoji.name}:\``,
      emojiUpdated: (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => `${emotes.uncategorised.enter} **EMOJI RENAMED**: ${newEmoji} \`:${oldEmoji.name}:\` → \`:${newEmoji.name}:\``,
      emojiDeleted: (emoji: GuildEmoji) => `${emotes.uncategorised.leave} **EMOJI REMOVED**: \`:${emoji.name}:\``,
      animatedEmojiAdded: (emoji: GuildEmoji) => `${emotes.uncategorised.enter} **ANIMATED EMOJI ADDED**: ${emoji} \`:${emoji.name}:\``,
      animatedEmojiUpdated: (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => `${emotes.uncategorised.enter} **ANIMATED EMOJI RENAMED**: ${newEmoji} \`:${oldEmoji.name}:\` → \`:${newEmoji.name}:\``,
      animatedEmojiDeleted: (emoji: GuildEmoji) => `${emotes.uncategorised.leave} **ANIMATED EMOJI REMOVED**: \`:${emoji.name}:\``,
    },
    events: {
      announcementMessages: (message: Message) => `\`[${timeFormatter(new Date(message.createdTimestamp))}]\` **\`[PUBLICATION NOTICE]\`** <:information:747497420954534050> **\`${message.author.tag}\`** (\`${message.author.id}\`) sent a message (\`${message.id}\`) in ${message.channel} (\`${message.channel.id}\`) that was automatically published. **MESSAGE LINK**: <https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}>`
    },
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
      removedAllExclusions: "Removed all exclusions.",
      roleNotResolved: "Role was not able to be resolved.",
      userNotResolved: "User was not able to be resolved.",
    },
    giveaway: {
      loadingMessage: "Loading...",
      notValidMessageID: "That is not a valid message ID! Try running without an ID to use the most recent giveaway in this channel.",
      giveawayEnded: "Giveaway has been ended.",
      noGiveawayMessageLinked: "The message you linked is not a giveaway message!",
      rerollNewWinner: (name: string, winner: User, messageLink: string) => [
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
      endedGivewaways: `${emotes.giveaway.giftmessage} **ENDED GIVEAWAYS**`,
    },
    help: {
      unknownCategory: "**UNKNOWN CATEGORY**",
      specificCommandHelp: `To get more information about a specific command, run \`${process.env.PREFIX}help [command]\`.`,
      noPermission: "I cannot retrieve additional information about this command as you do not satisfy its permission criteria.",
      noCommandFound: "No command exists with that name or alias. Please reinspect its spelling, as that may be a potential factor as to why it cannot be resolved.",
      noArgumentsNeeded: "No arguments need to be either mandatorily or optionally provided for this command.",
      noAliases: "No aliases exist for this command.",
      noDescription: "A description has not been specified for this command."
    },
    logging: {
      anonymisedAudit: (cmdTrigger: string, stringArgs: string[]) => `\`[${timeFormatter()}]\` **\`[ANONYMISED]\`** ${emotes.logging.anonymisedaudit} Command \`${cmdTrigger}\` was performed. No further information is available.`,
      administrativeCommand: (msg: Message, cmdTrigger: string, stringArgs: string[]) => `\`[${timeFormatter()}]\` **\`[ADMINISTRATIVE]\`** ${emotes.logging.administrativeaudit} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`,
      command: (msg: Message, cmdTrigger: string, stringArgs: string[]) => `\`[${timeFormatter()}]\` ${emotes.logging.audit} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`,
      disabledCommand: (msg: Message, cmdTrigger: string, stringArgs: string[]) => `\`[${timeFormatter()}]\` ${emotes.logging.audit} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) performed a disabled command \`${cmdTrigger}\` (\`${msg.id}\`)${stringArgs.length > 0 ? ` with args: \`${stringArgs.join(" ")}\`` : ""} in ${msg.channel} (\`${msg.channel.id}\`).`,
      linkResolver: (msg: Message, link: string, resLink: string) => [
        `\`[${timeFormatter()}]\` **\`[LINK REDIRECT RESOLVER]\`** ${emotes.logging.linkresolver} **\`${msg.author.tag}\`** (\`${msg.author.id}\`) sent a message (\`${msg.id}\`) containing a redirection-based link in ${msg.channel} (\`${msg.channel.id}\`).\n`,
        `**UNRESOLVED LINK**: <${link}>`,
        `**RESOLVED LINK**: <${resLink}>\n`,
        "No automatic action has been taken against their account or the message itself. Please review the above to ensure that the link is not violative of Evocation's regulations."
      ].join("\n"),
      userUpdate: (oldUser: User, newUser: User) => `\`[${timeFormatter()}]\` ${emotes.logging.nameupdate} User with ID \`${newUser.id}\` (${newUser}>) has changed their Discord username: \`**[${oldUser.username}]**\` → \`**[${newUser.username}]**\`.`,
      userBoost: (user: User) => [
        `Thank you for boosting **EVOCATION**, ${user}! You now have access to change your own nickname, embed links, attach files and stream into the server. If these permissions seem familiar to you, that means you are **LEVEL 3** or above.\n`,
        "**SUCCESSFULLY UNLOCKED**:",
        `${emotes.commandresponses.soulstones} Coloured **WISTERIA** Role [HOISTED]`,
        `${emotes.commandresponses.soulstones} Permanent x**2 EXPERIENCE MULTIPLIER**`,
        `${emotes.commandresponses.soulstones} Permanent Appearance in Server Leaderboard`,
        `${emotes.commandresponses.soulstones} Special Badge Appended to Your Entry in Server Leaderboard`,
        `${emotes.commandresponses.soulstones} **\`e!vb\`** Command Access [COMING SOON]`,
        `${emotes.commandresponses.soulstones} **\`e!muse\`** Command Access`
      ].join("\n"),
      disboardRoleAdd: "[FORCED REVOCATION] This role is protected from assignment.",
      hyacinthRoleRemoval: "[CONDITIONAL REVOCATION] User has a levelled role."
    },
    permissions: {
      negations: (type: "Reaction" | "Art" | "Media" | "Experience" | "Feedback") => `${type} negations have been executed for the specified users.`
    },
    util: {
      statusError: "Status needs to be `online`, `dnd`, `idle` or `invisible`.",
      statusSet: (status: string) => `My status is now **${status}**.`,
      gameError: "Type needs to be `watching`, `playing` or `listening`.",
      gameSet: (type: "watching" | "playing" | "listening", game: string) => `I am now ${type}${type === "listening" ? " to" : ""} **${game}**.`,
      linkDoesNotMatchDiscordLink: "Failed to identify Discord message link. If it should have matched, please try again.",
      guildWasNotFound: (id: string) => `Guild with ID \`${id}\` was not found.`,
      channelWasNotFound: (id: string) => `Channel with ID \`${id}\` was not found.`,
      messageWasNotFound: (id: string) => `Message with ID \`${id}\` was not found.`,
      messageEdited: "Message has been edited.",
      shutdown: "I can feel my Drearian Spirit fading...",
      aboutCommand: [
        "Hi! I am a custom bot designed for exclusive use by Evocation staff and members. An impermeable forcefield that surrounds the universe of Evocation prohibits me from being able to join and interact with other servers.\n",
        "__**PRIMARY CONTRIBUTORS**__\n",
        "**DEVELOPMENT TEAM LEAD**: <@209609796704403456>", // Stijn
        "**DEVELOPER**: <@366601247660441600>\n", // TheFabiCraft
        "__**SECONDARY CONTRIBUTORS**__\n",
        "**CHARACTER CONCEPTUALIST**: <@369497100834308106>", // Ace
        "**ABSTRACTION CONFIDANT**: <@700418258687230083>" // yesfromskribbl
      ].join("\n"),
      pinging: `${emotes.commandresponses.server} Pinging...`,
      pingResponse: (ms: number, discordPing: number) => `${emotes.commandresponses.server} **PONG**: My command latency is **${ms}** milliseconds. It took me **${discordPing}** milliseconds to receive a response from the Discord API.`,
      heartBeatResponse: (discordPing: number) => `${emotes.commandresponses.heartbeatrps} **BEEP**: My heartbeat is **${discordPing}** milliseconds.`,
      privacypolicy: {
        error: "Your User Settings are preventing me from being able to send you Direct Messages. Please rectify this issue and try again.",
        message1: [
          "Eris is a custom bot designed for use by Evocation staff and members. It includes features such as a levelling system, currency, informational commands, hierarchical advancement handlers and more. Some of Eris' features are intended for internal use, which is why they will not be discussed in a public environment.",
          "Most data that is passively collected by Eris is only accessible to server administrators or bot developers of Eris. All Evocation development team members are bound by a non-disclosure agreement, preventing them from being able to disseminate any information that has been defined to them as confidential.",
          "__**DATA COLLECTION PER ORIGINATOR BY COMMAND INVOCATIONS**__",
          "The contents of messages prefixed with `e!` may be processed, as well as messages prefixed with the bot mention. The following data is collected upon command invocation: the identifier of the invoking user, the channel the command was run in, as well as any other information that is provided by the Discord API.",
          "__**MESSAGE DETECTION**__",
          "For Eris' levelling system to work, she listens for new messages being sent, at which point relevant inhibitors are evaluated. If these are passed, experience (abbreviated 'XP') will be added to your account, in direct similitude with pre-defined internal values. We will not disclose these specificities as a circumvention of potential abuse/exploitation."
        ].join("\n\n"),
        message2: [
          "__**DIRECT MESSAGES**__",
          "Your Direct Messages with Eris may be logged, in approbation to permanence. Message edits and deletions may also be accessible to authorised users. We do not actively monitor Direct Messages, but we are able to ascertain their exactitudes should an investigation necessitate it. ",
          "__**ERASURE OF DATA**__",
          "Leaving the server will not result in any of your data being deleted. Instead, it will be saved so that it can be accessed again should you decide to re-join. You may request for the perpetual erasure of data that is directly associated with your account. To facilitate this, please send a Direct Message to <@747105315840983212>. You may only request one data deletion per thirty days. No exceptional anomalies will be allowed within the scope of possibility."
        ].join("\n\n")
      },
      cantdisablecommands: "Command cannot be disabled.",
      disabledcommand: "Command is now disabled.",
      notdisabledcommand: "Command is not disabled.",
      alreadydisabled: "Command is already disabled.",
      undisabledcommand: "Command enabled.",
      disabledCommandsEmbedHeader: "Disabled Commands",
      disabledCommandMap: (cmd: DisabledCommand) => `→ **${cmd.commandName}** - Disabled by <@${cmd.disabledBy}>`,
      noDisabledCommands: "There are no disabled commands.",
      datamine: [
        "Datamining is achieved through comparing the JavaScript files served to the Discord Canary client which have different hashes per build change.",
        "Please remember that a lot of build changes feature variable renaming, new tabs, newlines, etc., which usually do not change anything for the end user. With that in mind, do not take channel entries to be of definitive nature for upcoming features/releases.",
        "You can access all entries through the GitHub repository: https://github.com/DJScias/Discord-Datamining."
      ].join("\n\n")
    },
    purchaseableroles: {
      museCommand: [
        "You and I are seekers of the cosmos. The infinite is aglow with frequencies. Will is the driver of potentiality. Have you found your mission? It can be difficult to know where to begin. The quantum cycle is calling to you via ultrasonic energy. Can you hear it? Illusion is born in the gap where consciousness has been excluded. Only a child of the quantum matrix may release this reimagining of love. Where there is illusion, joy cannot thrive.",
        "Although you may not realize it, you are amazing. The planet is calling to you via frequencies. Can you hear it? Have you found your path?",
        "Our conversations with other seekers have led to an unveiling of pseudo-joyous consciousness. Humankind has nothing to lose. Wellbeing requires exploration. By condensing, we self-actualize. Guidance is a constant. Throughout history, humans have been interacting with the multiverse via vibrations. We are in the midst of a sublime maturing of love that will give us access to the quantum soup itself. Reality has always been buzzing with dreamweavers whose essences are enveloped in transcendence.",
        "This life is nothing short of a maturing vector of enlightened peace. To follow the path is to become one with it. We exist as ultrasonic energy.",
        "It can be difficult to know where to begin. How should you navigate this quantum dreamscape? Although you may not realize it, you are sentient. Eons from now, we entities will heal like never before as we are guided by the stratosphere. We must heal ourselves and bless others. The universe is approaching a tipping point. Soon there will be an evolving of coherence the likes of which the stratosphere has never seen. It is time to take understanding to the next level. Shiva will enable us to access divine potentiality.",
        "The temporal differential we call wakefulness is the cosmic interaction of subatomic particles operating in the quantum field, the (quantum)leap represents a fundamental universal constant that we can only speculate upon in the macro scale of wave form frequencies.",
        "We dream, we vibrate, we are reborn.",
        "Inspiration is a constant. Balance requires exploration.",
        "Imagine an awakening of what could be.",
        "We must heal ourselves and bless others. This circuit never ends. It is time to take intuition to the next level.",
        "Who are we? Where on the great circuit will we be reborn? Humankind has nothing to lose. Throughout history, humans have been interacting with the totality via morphogenetic fields.",
        "That that is, is. That that is not, is not. That is it, is it not?",
        "okay so it’s ok but it’s okay but it’s not ok but it has to me now it’s a great game and it’s so cute and it’s cute ok I wanna was the first time ever",
        "okay so it’s ok but it’s okay but it’s not ok",
        "iconic picture and a video to show me a lot more than I wanna cry like I know you can’t spell",
        "do you ever just",
        "scan the link to my account I don’t think I need it for the day or anything I can have to ask for it haha was a she said it would never be anything different from the server",
        "architecture and the other birds is the one who has no idea how much it will take for a long to be done to help them with the other hand",
        "baby progress I will have a question about the next time I am going on the hunt to see you guys and I will have to ask him about what you want me and you do not want me anything else you wanna is that you like to him",
        "ace game is so good game to kill me I gotta was a fun day lol I love it lol I wanna know what you wanna know lol I wanna know that I wanna cry like I gotta is the day I gotta is the way you look like you wanna is a time for us lol",
        "chicken wings with no chicken",
        "passion is not the same way of that lol but it was definitely a great app to help me find my life in a few years I am now and now my baby is so much better now than that ever happened I was told that she had no clue where she could have it and I wanna know how to you get it and I wanna know that you are mean and you don’t wanna cry like a child and then I have a question for that and I wanna cry is baby girl you are so stupid"
      ],
      educatemePrefix: `${emotes.commandresponses.educateme} **EDUCATION**:`,
      educateme: [
        "*Pentheraphobia* is the intense and disproportionate fear of your mother-in-law.",
        "Murmurations are the graceful, undulating patterns starlings create when they flock together in the sky. Scientists are still unsure how the birds coordinate their movements so quickly.",
        "A team of chemists described old book smell as “a combination of grassy notes with a tang of acids and a hint of vanilla over an underlying mustiness.” The odour actually comes from chemicals like benzaldehyde, furfural, and acetic acid—all byproducts of decomposition.",
        "Venetia Burney, who at age 11 suggested the name “Pluto” for the ninth planet in our solar system, lived to see it demoted to a dwarf planet in 2006.",
        "According to NASA, it possibly rains glass on the planet known as HD 189733b.",
        "“Bloodcurdling” isn’t just an expression: research shows that watching horror movies can increase a certain clotting protein in our bloodstreams.",
        "Sleep literally cleans your brain. During slumber, more cerebrospinal fluid flushes through the brain to wash away harmful proteins and toxins that build up during the day.",
        "On average, people in India spend 10 hours and 42 minutes a week reading, the most time of any country on Earth.",
        "Nicknamed ”sea bunnies”, *Jorunna parva* is actually a highly toxic species of sea slug.",
        "*Hippopotomonstrosesquippedaliophobia* is the fear of long words.",
        "The ampersand symbol is formed from the letters in et—the Latin word for \"and\".",
        "In 1897, Indiana state legislators tried to pass a bill that would have legally redefined the value of pi as 3.2.",
        "The number 4 is the only number with the same number of letters as the meaning of its name.",
        "Blue whales may weigh up to twice as much as the largest dinosaur.",
        "Bacon was used to make explosives during World War II.",
        "A face with big eyes, a small nose, and a small chin exhibits kinderschema: the collection of traits humans have evolved to find adorable.",
        "When it comes to wine, an aroma similar to cat pee is a considered a good thing.",
        "A group of clowns is sometimes called a giggle.",
        "Spiders recycle webs by eating them.",
      ],
      cancel_0: (user: User) => `${user} has been **CANCELLED**.`,
      cancel_1: (user: User) => `#${user.username.toLowerCase().replace(" ", "")}isoverparty`,
      cantCancelYourself: "You can't cancel yourself in this way.",
      cantCancelAdmins: "You can't cancel administrators.",
      cantCancelEris: "You can't cancel me.",
      auditLogRoleAdd: "[FORCED REVOCATION] Role was not added in similitude with systematic guidelines."
    },
    erisThanksMessage: [
      "Anytime! Well, as long as it’s convenient for me, that is.",
      "Pas de probleme.",
      "De rien.",
      "I'm happy to be of service.",
      "Happy to be of help!",
      "Don't mention it."
    ],
    erisGoodnightMessage: [
      (message: Message) => `<:catblush:752075380227309598> Goodnight, **${message.author.username}**!`,
      () => "Rest well, dear.",
      () => "Until the morning, then, I guess.",
      () => "See you!",
      () => "I hope your dreams are enchanted with beauty."
    ],
    levels: {
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
      levelSet: (user: User, level: number) => `**\`${user.tag}\`** (\`${user.id}\`) is now **LEVEL ${level}**.`,
      auditLogRoleRemove: "[FORCED ATTRIBUTION] Role was not removed from user with legitimacy.",
      multiplierCreated: (type: string, us: User | Role | Guild | TextChannel, amount: number, expireDate: Date) => `Type **${type.toUpperCase()}** multiplier created. This will affect ${us instanceof User ? `**\`${us.tag}\`** (\`${us.id}\`)` : us instanceof Role ? `**${us}** (\`${us.id}\`)` : us instanceof TextChannel ? `**${us}** (\`${us.id}\`)` : "the whole server"}. ${us instanceof Role ? "Users that have this role" : us instanceof Guild ? `All members of **${us.name.toUpperCase()}**` : us instanceof TextChannel ? "Users that talk in this channel" : "They"} will receive **${amount}** times as much experience as they usually would. ${expireDate ? `This multiplier is set to expire at **${timeFormatter(expireDate)}**. ` : ""}Run \`${process.env.PREFIX}multiplier list\` to retrieve a list of active multipliers, displayed categorically.`,
      missingUserId: "No user ID can be deduced from your command invocation. Please try again.",
      missingRoleId: "No role ID can be deduced from your command invocation. Please try again.",
      missingChannelId: "No channel ID can be deduced from your command invocation. Please try again.",
      removedMultiplier: "Multiplier(s) exhausted.",
      noMultiplierFound: "It does not appear that this user has an active experience multiplier.",
      multiplierEmbedName: (type: "Server" | "User" | "Role" | "Channel") => `${type} Multipliers`,
      noMultipliers: "There are no active multipliers under this category.",
      multiplierMapping: (ur: XPMultiplier) => {
        if (ur.type === "server")
          return `→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
        if (ur.type === "user")
          return `→ **User**: <@${ur.thingID}> (\`${ur.thingID}\`)\n→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
        if (ur.type === "role")
          return `→ **Role**: **<@&${ur.thingID}>** (\`${ur.thingID}\`)\n→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
        if (ur.type === "channel")
          return `→ **Channel**: **<#${ur.thingID}>** (\`${ur.thingID}\`)\n→ **Multiplier**: ${ur.multiplier}\n→ **Time of Expiration**: ${ur.endDate ? timeFormatter(ur.endDate) : "This multiplier will not automatically expire."}`;
      },
      levelRole: {
        add: (role: Role, level: number) => `Registered **${role}** as a levelled role. It will be automatically awarded to users at **LEVEL ${level}**.`,
        remove: (role: Role) => `Removed **${role}** from the levelled roles registry.`,
        alreadyRegistered: "This role is already registered as a level role.",
        doesNotExist: "This role is not configured to be awarded upon meeting an experience threshold.",
        noLevelledRoles: "No levelled roles have been configured.",
        levelledRolesEmbedTitle: "Levelled Roles",
        levelledRolesEmbedFooter: "These are the roles that will be automatically awarded to users based on predefined thresholds. Certain restrictions may be in place regarding their attribution/revocation.",
      },
      leaderboard: {
        header: `${emotes.commandresponses.leaderboard.leaderboard} **SERVER LEADERBOARD**\n`,
        boosterHeader: `\n${emotes.commandresponses.leaderboard.blobboost} **BOOSTER LEADERBOARD**`,
        row: (rank: number, user: User, level: number, totalXP: number, booster = false) => `${rankEmoji(rank)}**${rank}**. ${user} (\`${user.id}\`) » **LEVEL \`${level}\`** » **\`${totalXP}\` TOTAL EXPERIENCE** ${booster ? emotes.commandresponses.leaderboard.blobboost : ""}`
      }
    },
    moderation: {
      quote: {
        embedAuthor: (msg: Message) => `${msg.author.tag} (${msg.author.id})`,
        embedFooter: (msgId: string, channelName: string) => `Message ID: ${msgId} | Sent in #${channelName}`,
        unknownError: "Cannot quote this message; do I have permission to view the channel in which this message originates?",
        restrictedChannel: "You cannot quote a message from that channel as its access is highly restricted.",
        bot: "You cannot quote bots."
      }
    },
    affiliate: {
      cantAffiliateYourself: "You cannot execute affiliate commands on yourself.",
      cantAffiliateBots: "You may only use this command on users, not bots. Please only use these affiliation commands with necessity. Thank you.",
      affiliate: {
        success: (user: User) => `**\`${user.tag}\`** (\`${user.id}\`) has been awarded the <@&${ROLES.AFFILIATE}> role.`,
        denied: `${emotes.commandresponses.denial} That user is already an Evocation affiliate.`,
        audit: (user: User) => `User was selected to represent an affiliated server by ${user.tag}.`
      },
      removeaffiliate: {
        success: (user: User) => `**\`${user.tag}\`** (\`${user.id}\`) has had their <@&${ROLES.AFFILIATE}> role removed.`,
        denied: `${emotes.commandresponses.denial} That user is not an Evocation affiliate.`,
        audit: (user: User) => `Representative for a server is being changed/affiliation is being dissolved. Responsible User: ${user.tag}.`
      },
      listaffiliates: {
        embedFieldTitle: "Affiliates",
        noAffiliate: "→ No affliates.",
        affiliateMap: (member: GuildMember) => `→ ${member} (\`${member.id}\`)`,
      },
      roleRemoveNotLegitimacy: "[CONDITIONAL REVOCATION] Role was not added to user with legitimacy.",
      roleAddNotLegitimacy: "[FORCED ATTRIBTUION] Role was not removed from user with legitimacy.",
      welcomeMessage: (user: User) => [
        `Welcome, ${user}, to Evocation's **Affiliate Lounge**.`,
        `You have been selected as an **Affiliate Representative** for a server that is listed in <#${CHANNELS.AFFILIATE_LOUNGE}>`,
        "This channel is intended as a secure medium of liaison - you can communicate updates to your listing or questions about affiliation. Please also use this channel to notify us about anything that you believe may be of significance in relation to the future operation of your server that may influence your association with our server.",
        "This channel's access is restricted to **Administrators**, the **Server Growth Lead** and **Affiliate Representatives**."
      ].join("\n\n")
    }
  },
  commandGroups: {}
};


export const commandDescriptions = {
  send: "Forces Eris to send a message based on the second syntactic parameter. All mentions are forcibly escaped.",
  setstatus: "Updates Eris' status.",
  setgame: "Updates Eris' game.",
  edit: "Edits any message sent by Eris. She must have the 'Send Messages' permission node in the corresponding channel to be able to edit messages within it.",
  eval: "Eris will evaluate the input provided by the Bot Owner.",
  shutdown: "Forcibly restarts Eris.",
  directmessage: "Sends a Direct Message to the user provided.",
  deletedirectmessage: "Deletes a Direct Message sent by Eris.",
  about: "Returns information about the bot, its conception and contributors.",
  help: "Returns information about available commands.",
  logdonation: "Logs a donation and awards the 'White Hallows' role to the specified user, if they don't already have it.",
  negateart: "Appends/removes the '[NEGATION] Art' role to/from the specified user(s).",
  negatefeedback: "Appends/removes the '[NEGATION] Feedback' role to/from the specified user(s).",
  negatereaction: "Appends/removes the '[NEGATION] Reactions' role to/from the specified user(s).",
  negatemedia: "Appends/removes the '[NEGATION] Media' role to/from the specified user(s).",
  negateexperience: "Appends/removes the '[NEGATION] Experience' role to/from the specified user(s).",
  start: "Starts a giveaway in the channel in which this command is performed.",
  reroll: "Forces Eris to redetermine the winner of a giveaway. If no arguments are supplied, the most recent giveaway's winner will be rerolled.",
  end: "Ends a giveaway. If a message ID isn't supplied, the most recent active giveaway in the channel in which the command is being run in will be ended.",
  list: "Returns a list of all active giveaways on the server.",
  endall: "Forcibly ends all active giveaways on the server.",
  exclude: "Excludes a user or role from being able to interact with Eris.",
  exclusions: "Returns a list of active bot exclusions.",
  ping: "Returns Eris' command latency.",
  privacypolicy: "Returns Eris' Privacy Policy. The response to this command will be sent to the invoking user via Direct Messages to avoid any potentiality for spam.",
  disablecmd: "Forcibly disables a command to all users, regardless of defaulted permission inhibitors.",
  enablecmd: "Enables a previously-disabled command, forcing restoration of default inhibitors.",
  listdisabledcmds: "Lists all disabled commands.",
  muse: "Eris returns what's on her mind - take that as you will. You require **SENTRIES OF DESCENSUS**, **SCIONS OF ELYSIUM**, **WISTERIA** or **EVOCATION STAFF** to run this command.",
  channels: "Returns a list of all existing channels (categories, text and voice) within the server. For maintenance of confidentiality, this command can only be run in a specific channel intended for administrative usage of commands.",
  datamine: "Returns information about the server's `#datamining-feed` channel, its purpose and functionality.",
  xpignore: "Excludes a channel/role. Users will not be able to gain any experience within these channels/if they have an excluded role.",
  xpexclusions: "Removes a role/channel from being ignored or lists active exclusions categorically. Identifiers will only be parsed as arguments, not mentions.",
  leaderboard: "Returns a list of levelled users, showing their rank and total experience.",
  activateservermultiplier: "Activates a multiplier that affects the entire server.",
  activaterolemultiplier: "Activates a multiplier that affects an entire role.",
  activateusermultiplier: "Activates a multiplier that affects a single user.",
  multiplier: "Exhausts an active multiplier, lists all active multipliers or resets multipliers for the entire server/all users within a specified role.",
  resetxp: "Resets experience for the specified user(s)/role(s)/server.",
  addexperience: "Adds experience to a(n) user(s).",
  deductexperience: "Deducts experience from (a) user(s).",
  setlevel: "Forcibly updates a user's level. This action is strictly irreversible.",
  rank: "Displays the total experience and level progression of the invoking user. A user ID/mention can be provided as an argument.",
  addlevelledrole: "Adds a role that will be autmatically assigned to users upon meeting experience thresholds.",
  removelevelledrole: "Remove a role from being automatically assigned to users upon meeting experience thresholds.",
  listlevelledroles: "Returns a list of roles that are defined to be awarded to users upon meeting experience thresholds.",
  miraculum: "Awards a user with the 'Evocation Miraculum' role if they don't already have it.",
  version: "Returns Eris' deployment version and its title, if applicable.",
  quote: "Echoes a message that was sent by a user on the server.",
  cancel: "Cancels a user.",
  educateme: "Have Eris return an educational fact. This may be based on Evocation, Discord and everything outward.",
  affiliate: "Assigns a user the 'Affiliate Representative' role.",
  removeaffiliate: "Removes an Evocation affiliate.",
  listaffiliate: "Returns a list of users with the 'Affiliate Representative' role."
};

const rankEmoji = (rank: number): string => {
  if (rank === 1) return `${emotes.commandresponses.leaderboard.numberone} `;
  if (rank === 2) return `${emotes.commandresponses.leaderboard.numbertwo} `;
  if (rank === 3) return `${emotes.commandresponses.leaderboard.numberthree} `;
  return "       ";
};
