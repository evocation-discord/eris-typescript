import { regex } from "@utils/constants";
import { regExpEsc } from "@utils/constants/regex";
import { strings } from "@utils/messages";
import Discord from "discord.js";

export async function guild(arg: string, message: Discord.Message): Promise<Discord.Guild> {
  const guild = message.client.guilds.resolve(arg);
  if (!guild) throw new Error(strings.parsers.couldNotFindGuild);
  return guild;
}