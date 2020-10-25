/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { DisabledCommand } from "@utils/database/models";
import Discord from "discord.js";

export default {
  emojis: {
    notInServer: "I cannot retrieve emoji information about that server. Are you sure I'm in it?",
    messageHeader: (server: Discord.Guild) => [
      "__**EMOJI**__\n",
      `**SERVER**: ${server.name}`,
      `**SERVER ID**: ${server.id}\n`
    ].join("\n")
  },
  statusError: "Status needs to be `online`, `dnd`, `idle` or `invisible`.",
  statusSet: (status: string) => `My status is now **${status}**.`,
  gameError: "Type needs to be `watching`, `playing` or `listening`.",
  gameSet: (type: "watching" | "playing" | "listening", game: string) => `I am now ${type}${type === "listening" ? " to" : ""} **${game}**.`,
  cantdisablecommands: "Command cannot be disabled.",
  disabledcommand: "Command is now disabled.",
  notdisabledcommand: "Command is not disabled.",
  alreadydisabled: "Command is already disabled.",
  undisabledcommand: "Command enabled.",
  disabledCommandsEmbedHeader: "Disabled Commands",
  disabledCommandMap: (cmd: DisabledCommand) => `→ **${cmd.commandName}** - Disabled by <@${cmd.disabledBy}>`,
  noDisabledCommands: "There are no disabled commands.",
  shutdown: "I can feel my Drearian Spirit fading..."
};
