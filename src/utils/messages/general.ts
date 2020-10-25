/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { emotes } from "@utils/constants";
import Discord from "discord.js";

export default {
  success: (text: string) => `${emotes.commandresponses.success} **SUCCESS**: ${text}`,
  version: `${emotes.commandresponses.version} **VERSION**: Eris is currently running on version **1.5**, titled **THE EXPERIENCE UPDATE**, deployed on **12**/**09**/**2020** (DD/MM/YYYY).`,
  dmsclosed: "Your User Settings are preventing me from being able to send you Direct Messages. Please rectify this issue and try again.",
  checkdms: "Check your Direct Messages.",
  codeblockMember: (added: Discord.GuildMember[], removed: Discord.GuildMember[] = []): string => [
    "```diff",
    ...added.map((r) => `+ ${r.user.tag}`),
    ...removed.map((r) => `- ${r.user.tag}`),
    "```"
  ].join("\n"),
  rankEmoji: (rank: number): string => {
    if (rank === 1) return `${emotes.commandresponses.leaderboard.numberone} `;
    if (rank === 2) return `${emotes.commandresponses.leaderboard.numbertwo} `;
    if (rank === 3) return `${emotes.commandresponses.leaderboard.numberthree} `;
    return "       ";
  }
};
