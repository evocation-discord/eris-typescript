import { RedisClient } from "@utils/client";
import { Command } from "@utils/commands/Command";
import { env } from "@utils/constants";
import strings from "@utils/messages";
import Discord from "discord.js";
import humanizeDuration from "humanize-duration";

export function mergeInhibitors(a: Inhibitor, b: Inhibitor): Inhibitor {
  return async (msg, client): Promise<string | undefined> => {
    const aReason = await a(msg, client);
    if (aReason) return aReason;
    return b(msg, client);
  };
}

const botMaintainersOnly: Inhibitor = async (msg: Discord.Message) => {
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  return strings.errors.inhibitors.noPermission;
};

const guildsOnly: Inhibitor = async (msg) => (msg.member ? undefined : strings.errors.inhibitors.notInGuild);

const hasGuildPermission = (perm: Discord.PermissionResolvable): Inhibitor => mergeInhibitors(guildsOnly, async (msg) => (msg.member.hasPermission(perm)
  ? undefined
  : strings.errors.inhibitors.missingDiscordPermission(perm)));

const userCooldown = (ms: number): Inhibitor => async (msg, cmd): Promise<string | undefined> => {
  const mainGuild = msg.client.guilds.resolve(env.MAIN_GUILD_ID);
  const redisString = `user:${msg.author.id}:command:${cmd.triggers[0]}`;
  if (mainGuild.members.resolve(msg.author.id).roles.cache.some((role) => [env.ROLES.ADMINISTRATORS].includes(role.id))) return undefined;
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  if (await RedisClient.get(redisString)) return strings.errors.inhibitors.cooldown(humanizeDuration(await RedisClient.ttl(redisString) * 1000 || 0));
  await RedisClient.set(redisString, "1", "ex", ms / 1000);
  return undefined;
};

const moderatorOnly: Inhibitor = async (msg) => {
  const isNotGuild = await guildsOnly(msg);
  if (isNotGuild) return isNotGuild;
  const mainGuild = msg.client.guilds.resolve(env.MAIN_GUILD_ID);
  if (mainGuild.members.resolve(msg.author.id).roles.cache.some((role) => [env.ROLES.MODERATOR, env.ROLES.ADMINISTRATORS, env.ROLES.LEAD_ADMINISTRATORS].includes(role.id))) return undefined;
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  return strings.errors.inhibitors.noPermission;
};

const adminOnly: Inhibitor = async (msg, client) => {
  const isNotGuild = await guildsOnly(msg, client);
  if (isNotGuild) return isNotGuild;
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  const mainGuild = msg.client.guilds.resolve(env.MAIN_GUILD_ID);
  if (mainGuild.members.resolve(msg.author.id).roles.cache.some((role) => [env.ROLES.ADMINISTRATORS, env.ROLES.LEAD_ADMINISTRATORS].includes(role.id))) return undefined;
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  return strings.errors.inhibitors.noPermission;
};

const serverGrowthLeadOnly: Inhibitor = async (msg, client) => {
  const isNotGuild = await guildsOnly(msg, client);
  if (isNotGuild) return isNotGuild;
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  const mainGuild = msg.client.guilds.resolve(env.MAIN_GUILD_ID);
  if (mainGuild.members.resolve(msg.author.id).roles.cache.some((role) => [env.ROLES.ADMINISTRATORS, env.ROLES.LEAD_ADMINISTRATORS, env.ROLES.SERVER_GROWTH_LEAD].includes(role.id))) return undefined;
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  return strings.errors.inhibitors.noPermission;
};

const onlySomeRolesCanExecute = (roles: PermissionRole[]): Inhibitor => async (msg): Promise<string | undefined> => {
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  if (roles.includes("STAFF") && await roleValidation(msg, env.ROLES.STAFF)) return undefined;
  if (roles.includes("SCIONS OF ELYSIUM") && await roleValidation(msg, env.ROLES.SCIONS_OF_ELYSIUM)) return undefined;
  if (roles.includes("SENTRIES OF DESCENSUS") && await roleValidation(msg, env.ROLES.SENTRIES_OF_DESCENSUS)) return undefined;
  if (roles.includes("ORION") && await roleValidation(msg, env.ROLES.ORION)) return undefined;
  if (roles.includes("CHRONOS") && await roleValidation(msg, env.ROLES.CHRONOS)) return undefined;
  if (roles.includes("EOS") && await roleValidation(msg, env.ROLES.EOS)) return undefined;
  return strings.errors.inhibitors.noPermission;
};

export const roleValidation = async (msg: Discord.Message, roleID: string): Promise<boolean> => {
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  if (!msg.member) return false;
  const mainGuild = msg.client.guilds.resolve(env.MAIN_GUILD_ID);
  return mainGuild.members.resolve(msg.author.id).roles.cache.has(roleID);
};

const canOnlyBeExecutedInBotCommands = mergeInhibitors(guildsOnly, async (msg) => {
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  if ((msg.channel as Discord.TextChannel).name !== "bot-commands") return strings.errors.inhibitors.requestRejectedBotCommands;
  return undefined;
});

const canOnlyBeExecutedInChannels = (channels: string[], silent = false): Inhibitor => mergeInhibitors(guildsOnly, async (msg) => {
  if (msg.client.botMaintainers.includes(msg.author.id)) return undefined;
  if (channels.includes(msg.channel.id)) return undefined;
  if (channels.includes((msg.channel as Discord.TextChannel).name)) return undefined;
  if (silent) return "Silent";
  return strings.errors.inhibitors.requestRejected;
});

export type Inhibitor = (
  msg: Discord.Message,
  command?: Command,
) => Promise<string | undefined>;
export const inhibitors = {
  botMaintainersOnly,
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

type PermissionRole = "STAFF" | "EOS" | "SCIONS OF ELYSIUM" | "SENTRIES OF DESCENSUS" | "CHRONOS" | "ORION";
