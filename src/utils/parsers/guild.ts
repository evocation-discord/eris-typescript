import strings from "@utils/messages";
import Discord from "discord.js";

export function guild(arg: string, message: Discord.Message): Discord.Guild {
  const _guild = message.client.guilds.resolve(arg);
  if (!_guild) throw new Error(strings.errors.parsers.couldNotFindGuild);
  return _guild;
}
