/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { emotes } from "@utils/constants";
import Discord from "discord.js";

export default {
  parsers: {
    couldNotFindGuildMember: "Could not find that guild member.",
    couldNotFindUser: "Could not find that user.",
    couldNotFindGuild: "Could not find that guild.",
    couldNotFindTextChannel: "Could not find that text channel.",
    couldNotFindNewsChannel: "Could not find that news channel.",
    couldNotFindVoiceChannel: "Could not find that voice channel.",
    couldNotFindGuildChannel: "Could not find that guild channel.",
    couldNotFindCategory: "Could not find that category.",
    couldNotFindRole: "Could not find that role."
  },
  inhibitors: {
    noPermission: "You do not satisfy the predefined criteria to be able to perform this command.",
    notInGuild: "You are not in a guild.",
    missingDiscordPermission: (permission: Discord.PermissionResolvable) => `You do not satisfy a Discord permission node: **${permission}**.`,
    cooldown: (cooldown: string) => `You must wait **${cooldown}** to run this command!`,
    requestRejectedBotCommands: "Request has been rejected. Please run this command in <#528598988673253376>!",
    requestRejected: "Request has been rejected."
  },
  commandDisabled: "This command has been disabled, hence this denial of access. If you believe this administrative action was in error, please contact a Bot Owner (users who are accredited in `e!about`).",
  somethingWentWrong: "Something went wrong. You should never see this response.",
  commandSyntaxError: (usage: string, error: string) => `A syntactic error was encountered. Angle brackets are indicative of required arguments, while square brackets are indicative of optional arguments.\n**SYNTAX**: \`${usage}\`\n**ERROR**: ${error}`,
  arguments: {
    noArgumentSupplied: "No argument(s) was/were supplied.",
    remainderBlank: "Remainder of the command is blank.",
    invalidDuration: "Invalid duration.",
    invalidNumber: "Could not identify number within syntactic parameters."
  },
  commandSyntax: (text: string) => `Syntactic fallacy detected. **COMMAND SYNTAX**: \`${text}\``,
  error: (text: string) => `${emotes.commandresponses.denial} **COMMAND INHIBITED**: ${text}`,
  errorMessage: async (message: Discord.Message, error: string): Promise<void> => {
    const msg = await message.channel.send(error);
    msg.delete({ timeout: 5000 });
  }
};
