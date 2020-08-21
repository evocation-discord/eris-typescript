import { Message, PermissionResolvable } from "discord.js";
import humanizeDuration from "humanize-duration";
import { ErisClient } from "../client/ErisClient";
import { TextChannel } from "discord.js";
import { ROLES } from "../constants";

export function mergeInhibitors(a: Inhibitor, b: Inhibitor): Inhibitor {
  return async (msg, client) => {
    const aReason = await a(msg, client);
    if (aReason) return aReason;
    else return await b(msg, client);
  };
}

const botAdminsOnly: Inhibitor = async (
  msg: Message,
  client: ErisClient
) => (client.botAdmins.includes(msg.author.id) ? undefined : "You are not authorised to use this command.");

const guildsOnly: Inhibitor = async msg =>
  msg.member ? undefined : "You are not in a guild.";

const hasGuildPermission = (perm: PermissionResolvable): Inhibitor =>
  mergeInhibitors(guildsOnly, async msg =>
    msg.member.hasPermission(perm)
      ? undefined
      : `You miss a discord permission:${perm}`
  );

const userCooldown = (ms: number): Inhibitor => {
  const map: Map<string, number> = new Map();
  return async msg => {
    if (map.has(msg.author.id)) {
      if ((map.get(msg.author.id) || 0) < Date.now()) {
        map.set(msg.author.id, Date.now() + ms);
        return undefined;
      } else {
        return `You must wait ${humanizeDuration(
          Date.now() - (map.get(msg.author.id) || 0)
        )} to run this command!`;
      }
    } else {
      map.set(msg.author.id, Date.now() + ms);
      return undefined;
    }
  };
};

const moderatorOnly: Inhibitor = async (msg, client) => {
  const isNotGuild = await guildsOnly(msg, client);
  if (isNotGuild) return isNotGuild;
  if (msg.member.roles.cache.has(ROLES.MODERATION)) return undefined;
  return "You are not authorised to use this command.";
};

const canOnlyBeExecutedInBotCommands =
  mergeInhibitors(guildsOnly, async (msg, client) => {
    if (client.botAdmins.includes(msg.author.id)) return undefined;
    if ((msg.channel as TextChannel).name !== "bot-commands") return "Request has been rejected. Please run this command in #bot-commands!";
    return undefined;
  });

export type Inhibitor = (
  msg: Message,
  client: ErisClient
) => Promise<string | undefined>;
export const inhibitors = {
  botAdminsOnly,
  guildsOnly,
  hasGuildPermission,
  userCooldown,
  canOnlyBeExecutedInBotCommands,
  moderatorOnly
};