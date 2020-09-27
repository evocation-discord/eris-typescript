import { Message, PermissionResolvable } from "discord.js";
import humanizeDuration from "humanize-duration";
import { ErisClient } from "../client/ErisClient";
import { TextChannel } from "discord.js";
import { MAIN_GUILD_ID, ROLES } from "../constants";
import { strings } from "../messages";
import { Command } from "..";
import RedisClient from "../client/RedisClient";

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
  return async (msg, cmd) => {
    const mainGuild = msg.client.guilds.resolve(MAIN_GUILD_ID);
    const redisString = `user:${msg.author.id}:command:${cmd.triggers[0]}`;
    if (mainGuild.members.resolve(msg.author.id).roles.cache.some(role => [ROLES.ADMINISTRATORS].includes(role.id))) return undefined;
    if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
    if (await RedisClient.get(redisString)) return strings.inhibitors.cooldown(humanizeDuration(await RedisClient.ttl(redisString) * 1000 || 0));
    await RedisClient.set(redisString, "1", "ex", ms / 1000);
    return undefined;
  };
};

const moderatorOnly: Inhibitor = async (msg) => {
  const isNotGuild = await guildsOnly(msg);
  if (isNotGuild) return isNotGuild;
  const mainGuild = msg.client.guilds.resolve(MAIN_GUILD_ID);
  if (mainGuild.members.resolve(msg.author.id).roles.cache.some(role => [ROLES.MODERATOR, ROLES.ADMINISTRATORS, ROLES.LEAD_ADMINISTRATORS].includes(role.id))) return undefined;
  return strings.inhibitors.noPermission;
};

const adminOnly: Inhibitor = async (msg, client) => {
  const isNotGuild = await guildsOnly(msg, client);
  if (isNotGuild) return isNotGuild;
  if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
  const mainGuild = msg.client.guilds.resolve(MAIN_GUILD_ID);
  if (mainGuild.members.resolve(msg.author.id).roles.cache.some(role => [ROLES.ADMINISTRATORS, ROLES.LEAD_ADMINISTRATORS].includes(role.id))) return undefined;
  return strings.inhibitors.noPermission;
};

const serverGrowthLeadOnly: Inhibitor = async (msg, client) => {
  const isNotGuild = await guildsOnly(msg, client);
  if (isNotGuild) return isNotGuild;
  if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
  const mainGuild = msg.client.guilds.resolve(MAIN_GUILD_ID);
  if (mainGuild.members.resolve(msg.author.id).roles.cache.some(role => [ROLES.ADMINISTRATORS, ROLES.LEAD_ADMINISTRATORS, ROLES.SERVER_GROWTH_LEAD].includes(role.id))) return undefined;
  return strings.inhibitors.noPermission;
};

const onlySomeRolesCanExecute = (roles: PermissionRole[]): Inhibitor => {
  return async msg => {
    if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
    if (roles.includes("STAFF") && await roleValidation(msg, ROLES.STAFF)) return undefined;
    if (roles.includes("SCIONS OF ELYSIUM") && await roleValidation(msg, ROLES.SCIONS_OF_ELYSIUM)) return undefined;
    if (roles.includes("SENTRIES OF DESCENSUS") && await roleValidation(msg, ROLES.SENTRIES_OF_DESCENSUS)) return undefined;
    if (roles.includes("EVOCATION OCULI") && await roleValidation(msg, ROLES.EVOCATION_OCULI)) return undefined;
    if (roles.includes("EVOCATION LACUNAE") && await roleValidation(msg, ROLES.EVOCATION_LACUNAE)) return undefined;
    if (roles.includes("WISTERIA") && await roleValidation(msg, ROLES.WISTERIA)) return undefined;
    return strings.inhibitors.noPermission;
  };
};

const roleValidation = async (msg: Message, roleID: string): Promise<boolean> => {
  if (!msg.member) return false;
  const mainGuild = msg.client.guilds.resolve(MAIN_GUILD_ID);
  return mainGuild.members.resolve(msg.author.id).roles.cache.has(roleID);
};

const canOnlyBeExecutedInBotCommands =
  mergeInhibitors(guildsOnly, async (msg) => {
    if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
    if (msg.channel.id === "528598741565833246") return undefined;
    if ((msg.channel as TextChannel).name !== "bot-commands") return strings.inhibitors.requestRejectedBotCommands;
    return undefined;
  });

const canOnlyBeExecutedInChannels = (channels: string[], silent = false): Inhibitor =>
  mergeInhibitors(guildsOnly, async (msg) => {
    if (msg.client.botAdmins.includes(msg.author.id)) return undefined;
    if (channels.includes(msg.channel.id)) return undefined;
    if (channels.includes((msg.channel as TextChannel).name)) return undefined;
    if (silent) return "Silent";
    return strings.inhibitors.requestRejected;
  });


export type Inhibitor = (
  msg: Message,
  command?: Command,
) => Promise<string | undefined>;
export const inhibitors = {
  botAdminsOnly,
  guildsOnly,
  hasGuildPermission,
  userCooldown,
  canOnlyBeExecutedInBotCommands,
  moderatorOnly,
  adminOnly,
  onlySomeRolesCanExecute,
  serverGrowthLeadOnly,
  canOnlyBeExecutedInChannels
};

type PermissionRole = "STAFF" | "WISTERIA" | "SCIONS OF ELYSIUM" | "SENTRIES OF DESCENSUS" | "EVOCATION LACUNAE" | "EVOCATION OCULI";