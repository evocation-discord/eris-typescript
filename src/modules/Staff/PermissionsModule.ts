import { Remainder } from "@utils/arguments";
import { command, CommandCategories } from "@utils/commands";
import { env } from "@utils/constants";
import { inhibitors } from "@utils/inhibitors/Inhibitor";
import { commandDescriptions, strings, codeblockMember } from "@utils/messages";
import { Module } from "@utils/modules";
import { guildMember as guildMemberParser } from "@utils/parsers";
import Discord from "discord.js";

export default class PermissionsModule extends Module {
  @command({ inhibitors: [inhibitors.moderatorOnly], group: CommandCategories["Moderation"], args: [new Remainder(String)], aliases: ["na"], staff: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.negateart })
  async negateart(msg: Discord.Message, _members: string): Promise<void> {
    msg.delete();
    const members: Discord.GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    if (members.includes(msg.member)) members.splice(members.indexOf(msg.member), 1);
    const added: Discord.GuildMember[] = [];
    const removed: Discord.GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(env.NEGATIONS.ART)) {
        member.roles.remove(env.NEGATIONS.ART);
        removed.push(member);
      } else {
        member.roles.add(env.NEGATIONS.ART);
        added.push(member);
      }
    }
    await msg.channel.send([strings.general.success(strings.modules.permissions.negations("Art")), codeblockMember(added, removed)].join("\n"), { split: true });
  }

  @command({ inhibitors: [inhibitors.moderatorOnly], group: CommandCategories["Moderation"], args: [new Remainder(String)], aliases: ["nf"], staff: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.negatefeedback })
  async negatefeedback(msg: Discord.Message, _members: string): Promise<void> {
    msg.delete();
    const members: Discord.GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    if (members.includes(msg.member)) members.splice(members.indexOf(msg.member), 1);
    const added: Discord.GuildMember[] = [];
    const removed: Discord.GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(env.NEGATIONS.FEEDBACK)) {
        member.roles.remove(env.NEGATIONS.FEEDBACK);
        removed.push(member);
      } else {
        member.roles.add(env.NEGATIONS.FEEDBACK);
        added.push(member);
      }
    }
    await msg.channel.send([strings.general.success(strings.modules.permissions.negations("Feedback")), codeblockMember(added, removed)].join("\n"), { split: true });
  }

  @command({ inhibitors: [inhibitors.moderatorOnly], group: CommandCategories["Moderation"], args: [new Remainder(String)], aliases: ["nr"], staff: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.negatereaction })
  async negatereaction(msg: Discord.Message, _members: string): Promise<void> {
    msg.delete();
    const members: Discord.GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    if (members.includes(msg.member)) members.splice(members.indexOf(msg.member), 1);
    const added: Discord.GuildMember[] = [];
    const removed: Discord.GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(env.NEGATIONS.REACTIONS)) {
        member.roles.remove(env.NEGATIONS.REACTIONS);
        removed.push(member);
      } else {
        member.roles.add(env.NEGATIONS.REACTIONS);
        added.push(member);
      }
    }
    await msg.channel.send([strings.general.success(strings.modules.permissions.negations("Reaction")), codeblockMember(added, removed)].join("\n"), { split: true });
  }

  @command({ inhibitors: [inhibitors.moderatorOnly], group: CommandCategories["Moderation"], args: [new Remainder(String)], aliases: ["nm"], staff: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.negatemedia })
  async negatemedia(msg: Discord.Message, _members: string): Promise<void> {
    msg.delete();
    const members: Discord.GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    if (members.includes(msg.member)) members.splice(members.indexOf(msg.member), 1);
    const added: Discord.GuildMember[] = [];
    const removed: Discord.GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(env.NEGATIONS.MEDIA)) {
        member.roles.remove(env.NEGATIONS.MEDIA);
        removed.push(member);
      } else {
        member.roles.add(env.NEGATIONS.MEDIA);
        added.push(member);
      }
    }
    await msg.channel.send([strings.general.success(strings.modules.permissions.negations("Media")), codeblockMember(added, removed)].join("\n"), { split: true });
  }

  @command({ inhibitors: [inhibitors.moderatorOnly], group: CommandCategories["Moderation"], args: [new Remainder(String)], aliases: ["ne"], staff: true, usage: "<members:...guildmember|snowflake>", description: commandDescriptions.negateexperience })
  async negateexperience(msg: Discord.Message, _members: string): Promise<void> {
    msg.delete();
    const members: Discord.GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    if (members.includes(msg.member)) members.splice(members.indexOf(msg.member), 1);
    const added: Discord.GuildMember[] = [];
    const removed: Discord.GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(env.NEGATIONS.EXPERIENCE)) {
        member.roles.remove(env.NEGATIONS.EXPERIENCE);
        removed.push(member);
      } else {
        member.roles.add(env.NEGATIONS.EXPERIENCE);
        added.push(member);
      }
    }
    await msg.channel.send([strings.general.success(strings.modules.permissions.negations("Experience")), codeblockMember(added, removed)].join("\n"), { split: true });
  }
}