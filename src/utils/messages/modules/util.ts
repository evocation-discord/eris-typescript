/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { emotes } from "@utils/constants";

export default {
  linkDoesNotMatchDiscordLink: "Failed to identify Discord message link. If it should have matched, please try again.",
  guildWasNotFound: (id: string) => `Guild with ID \`${id}\` was not found.`,
  channelWasNotFound: (id: string) => `Channel with ID \`${id}\` was not found.`,
  messageWasNotFound: (id: string) => `Message with ID \`${id}\` was not found.`,
  messageEdited: "Message has been edited.",
  aboutCommand: [
    "Hi! I am a custom bot designed for exclusive use by Evocation staff and members. An impermeable forcefield that surrounds the universe of Evocation prohibits me from being able to join and interact with other servers.\n",
    "__**CONTRIBUTORS**__\n",
    "**DEVELOPMENT TEAM LEAD**: <@209609796704403456>", // Stijn
    "**CHARACTER CONCEPTUALIST**: <@369497100834308106>" // Ace
  ].join("\n"),
  pinging: `${emotes.commandresponses.server} Pinging...`,
  pingResponse: (ms: number, discordPing: number) => `${emotes.commandresponses.server} **PONG**: My command latency is **${ms}** milliseconds. It took me **${discordPing}** milliseconds to receive a response from the Discord API.`,
  heartBeatResponse: (discordPing: number) => `${emotes.commandresponses.heartbeatrps} **BEEP**: My heartbeat is **${discordPing}** milliseconds.`,
  privacypolicy: {
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
  currency: [
    `${emotes.commandresponses.soulstones} __**SOULSTONES**__\n`,
    "The following roles __**must**__ be purchased in order, with the first being at the top and the final role being at the bottom. Commands will error if you attempt to purchase a role that is not directly after the one you currently have.\n",
    "**<@&728566031022555176>** » Purchasable with **500** Soulstones.",
    "**<@&728566064388112384>** » Purchasable with **1000** Soulstones.",
    "**<@&730129487806726145>** » Purchasable with **3000** Soulstones.",
    "**<@&730510562202615809>** » Purchasable with **5000** Soulstones.\n",
    "In certain channels, currency generation is enabled, where the first user to perform a command will be able to 'collect' the Soulstones that have emerged. There will always be a unique code to prevent immediate collection!\n",
    "__**COMMANDS**__\n",
    "`e!sshop` » Displays a list of available roles and items that you can purchase.",
    "`e!sbuy <index>` » Purchases a role or item. Indexes are denoted by the number after the #.",
    "`e!ss` » Returns the amount of Soulstones you currently have.",
    `\`e!ri\` » Redeems **25** ${emotes.commandresponses.soulstones}. Upon this command being processed, a **6 hour** user cooldown will be activated.`,
    "`e!collect <code>` » Collects an amount of Soulstones that have emerged.\n",
    "**<@&528574377722249216>** and/or bot maintainers will be notified in an internal channel when you purchase an item; the command success message will verify this. You will be contacted through Hexyte to seal the transaction."
  ].join("\n")
};
