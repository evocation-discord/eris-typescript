export * from "./constants";

import { ErisClient } from "./client/ErisClient";
import { Command } from "./commands/Command";
import { CommandManager } from "./commands/CommandManager";
import { CommandParserModule } from "./commands/CommandParser";
import { GiveawayArgs } from "./GiveawayManager";
import { MessageEmbed, MessageEmbedOptions, Message, Role, User, TextChannel } from "discord.js";
import { resolveRole, resolveUser, resolveChannel } from "./arguments/supportedArgs";
import { strings } from "./messages";

export { ErisClient, Command, CommandManager, CommandParserModule, GiveawayArgs };

export * from "./arguments/ArgumentProcessor";
export * from "./arguments/Arguments";
export * from "./arguments/supportedArgs";

export * from "./commands/decorator";

export * from "./inhibitors/Inhibitor";
export * from "./listener/Listener";
export * from "./listener/ListenerManager";
export * from "./listener/decorator";

export * from "./monitor/Monitor";
export * from "./monitor/MonitorManager";
export * from "./monitor/decorator";

export * from "./cron/Cron";
export * from "./cron/CronManager";
export * from "./cron/decorator";

export * from "./modules/Module";

export * from "./messages";

export * from "./scheduler/Scheduler";

export const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const timeFormatter = (date?: Date): string => {
  if (!date) date = new Date();
  const _hour = `0${date.getUTCHours()}`;
  const _minutes = `0${date.getUTCMinutes()}`;
  const _day = `0${date.getUTCDate()}`;
  const _month = `0${date.getUTCMonth() + 1}`;
  const year = date.getUTCFullYear();

  const hour = _hour.slice(-2);
  const minutes = _minutes.slice(-2);
  const day = _day.slice(-2);
  const month = _month.slice(-2);
  return `${hour}:${minutes} ${day}/${month}/${year} UTC`;
};

export const getDuration = (duration: number): string => {
  const data = [];
  duration /= 1000;

  const hour = Math.floor(duration / 60 / 60 % 24);
  const min = Math.floor(duration / 60 % 60);
  const sec = Math.floor(duration % 60);
  if (sec >= 1) data.push(`**${sec}** second${sec > 1 ? "s" : ""}`);
  if (min >= 1) data.push(`**${min}** minute${min > 1 ? "s" : ""}`);
  if (hour >= 1) data.push(`**${hour}** hour${hour > 1 ? "s" : ""}`);

  duration /= 60 * 60 * 24;

  const days = Math.floor(duration % 365 % 30 % 7);
  const week = Math.floor(duration % 365 % 30 / 7);
  if (days >= 1) data.push(`**${days}** day${days > 1 ? "s" : ""}`);
  if (week >= 1) data.push(`**${week}** week${week > 1 ? "s" : ""}`);

  if (duration >= 27) {
    if (duration < 46) return "a month";
    else if (duration < 320) return `${Math.round(duration / 30)} months`;
    else if (duration < 548) return "a year";
    return `${Math.round(duration / 365)} years`;
  }
  if (data.length === 0) return "**0** seconds";
  return `${data.reverse().slice(0, 2).join(" and ")}`;
};

export const regExpEsc = (str: string): string => {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};


export class Embed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super({ color: "EECC41", ...data });
  }
}

export const roleParser = async (arg: string, msg: Message): Promise<string | Role> => {
  const resRole = await resolveRole(arg, msg);
  if (resRole) return resRole;

  const results: Role[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const role of msg.guild.roles.cache.values())
    if (reg.test(role.name)) results.push(role);

  let querySearch: Role[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(role => regWord.test(role.name));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) return strings.modules.exclusions.roleNotResolved;
  return querySearch[0];
};

export const userParser = async (arg: string, msg: Message): Promise<string | User> => {
  const resUser = await resolveUser(arg, msg.guild);
  if (resUser) return resUser;

  const results: User[] = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const member of msg.guild.members.cache.values()) {
    if (reg.test(member.user.username)) results.push(member.user);
  }

  let querySearch: User[];
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(user => regWord.test(user.username));
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) return strings.modules.exclusions.userNotResolved;
  return querySearch[0];
};

export const channelParser = async (arg: string, msg: Message): Promise<string | TextChannel> => {
  const resChannel = await resolveChannel(arg, msg.guild);
  if (resChannel) return resChannel;

  const results = [];
  const reg = new RegExp(regExpEsc(arg), "i");
  for (const channel of msg.guild.channels.cache.values()) {
    if (reg.test(channel.name)) results.push(channel);
  }

  let querySearch;
  if (results.length > 0) {
    const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, "i");
    const filtered = results.filter(channel => regWord.test(channel.name) && channel.type === "text");
    querySearch = filtered.length > 0 ? filtered : results;
  } else {
    querySearch = results;
  }

  if (querySearch.length === 0) return strings.arguments.couldNotFindTextChannel;
  return querySearch[0];
};