import { Message, PermissionResolvable } from "discord.js";
import humanizeDuration from "humanize-duration";
import { ErisClient } from "../client/ErisClient";
import { TextChannel } from "discord.js";
import { ROLES } from "../constants";
import { strings } from "../messages";

export function mergeInhibitors(a: Inhibitor, b: Inhibitor): Inhibitor {
  return async (msg, client) => {
    const aReason = await a(msg, client);
    if (aReason) return aReason;
    else return await b(msg, client);
  };
}

const botAdminsOnly: Inhibitor = async (msg: Message) => {
  if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
  return strings.inhibitors.noPermission;
};

const guildsOnly: Inhibitor = async msg =>
  msg.member ? undefined : strings.inhibitors.notInGuild;

const hasGuildPermission = (perm: PermissionResolvable): Inhibitor =>
  mergeInhibitors(guildsOnly, async msg =>
    msg.member.hasPermission(perm)
      ? undefined
      : strings.inhibitors.missingDiscordPermission(perm)
  );

const userCooldown = (ms: number): Inhibitor => {
  const map: Map<string, number> = new Map();
  return async msg => {
    if (map.has(msg.author.id)) {
      if ((map.get(msg.author.id) || 0) < Date.now()) {
        map.set(msg.author.id, Date.now() + ms);
        return undefined;
      } else {
        return strings.inhibitors.cooldown(humanizeDuration(Date.now() - (map.get(msg.author.id) || 0)));
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
  if (msg.member.roles.cache.some(role => [ROLES.STAFF, ROLES.ADMINISTRATORS].includes(role.id))) return undefined;
  return strings.inhibitors.noPermission;
};

const adminOnly: Inhibitor = async (msg, client) => {
  const isNotGuild = await guildsOnly(msg, client);
  if (isNotGuild) return isNotGuild;
  if (msg.member.roles.cache.some(role => [ROLES.ADMINISTRATORS].includes(role.id))) return undefined;
  return strings.inhibitors.noPermission;
};

const onlySomeRolesCanExecute = (roles: PermissionRole[]): Inhibitor => {
  return async msg => {
    if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
    if (roles.includes("STAFF") && await roleValidation(msg, ROLES.STAFF)) return undefined;
    if (roles.includes("SCIONS OF ELYSIUM") && await roleValidation(msg, ROLES.SCIONS_OF_ELYSIUM)) return undefined;
    if (roles.includes("SENTRIES OF DESCENSUS") && await roleValidation(msg, ROLES.SENTRIES_OF_DESCENSUS)) return undefined;
    if (roles.includes("WISTERIA") && await roleValidation(msg, ROLES.WISTERIA)) return undefined;
    return strings.inhibitors.noPermission;
  };
};

const roleValidation = async (msg: Message, roleID: string): Promise<boolean> => {
  if (!msg.member) return false;
  return msg.member.roles.cache.has(roleID);
};

const canOnlyBeExecutedInBotCommands =
  mergeInhibitors(guildsOnly, async (msg, client) => {
    if (client.botAdmins.includes(msg.author.id)) return undefined;
    if ((msg.channel as TextChannel).name !== "bot-commands") return strings.inhibitors.requestRejected;
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
  moderatorOnly,
  adminOnly,
  onlySomeRolesCanExecute
};

type PermissionRole = "STAFF" | "WISTERIA" | "SCIONS OF ELYSIUM" | "SENTRIES OF DESCENSUS";