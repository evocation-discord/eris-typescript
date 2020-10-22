/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Discord from "discord.js";
import { emotes, env } from "@utils/constants";

export default {
  cantAffiliateYourself: "You cannot execute affiliate commands on yourself.",
  cantAffiliateBots: "You may only use this command on users, not bots. Please only use these affiliation commands with necessity. Thank you.",
  affiliate: {
    success: (user: Discord.User) => `**\`${user.tag}\`** (\`${user.id}\`) has been awarded the **<@&${env.ROLES.AFFILIATE}>** role.`,
    denied: `${emotes.commandresponses.denial} That user is already an Evocation affiliate.`,
    audit: (user: Discord.User) => `User was selected to represent an affiliated server by ${user.tag}.`
  },
  removeaffiliate: {
    success: (user: Discord.User) => `**\`${user.tag}\`** (\`${user.id}\`) has had their **<@&${env.ROLES.AFFILIATE}>** role removed.`,
    denied: `${emotes.commandresponses.denial} That user is not an Evocation affiliate.`,
    audit: (user: Discord.User) => `Representative for a server is being changed/affiliation is being dissolved. Responsible User: ${user.tag}.`
  },
  listaffiliates: {
    embedFieldTitle: "Affiliates",
    noAffiliate: "→ There are currently no Affiliate Representatives.",
    affiliateMap: (member: Discord.GuildMember) => `→ ${member} (\`${member.id}\`)`
  },
  roleRemoveNotLegitimacy: "[CONDITIONAL REVOCATION] Role was not added to user with legitimacy.",
  roleAddNotLegitimacy: "[FORCED ATTRIBTUION] Role was not removed from user with legitimacy.",
  welcomeMessage: (user: Discord.User) => [
    `Welcome, ${user}, to Evocation's **Affiliate Lounge**.`,
    `You have been selected as an **Affiliate Representative** for a server that is listed in <#${env.CHANNELS.AFFILIATE_LOUNGE}>.`,
    "This channel is intended as a secure medium of liaison - you can communicate updates to your listing or questions about affiliation. Please also use this channel to notify us about anything that you believe may be of significance in relation to the future operation of your server that may influence your association with our server.",
    "This channel's access is restricted to **Administrators**, the **Outreach Lead** and **Affiliate Representatives**."
  ].join("\n\n")
};
