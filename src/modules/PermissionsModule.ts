import { Module, command, inhibitors, Remainder, guildMemberParser, NEGOTATIONS } from "@lib/utils";
import { GuildMember, Message } from "discord.js";

export default class PermissionsModule extends Module {
  @command({ inhibitors: [inhibitors.moderatorOnly], group: "Permission Negations", args: [new Remainder(String)], aliases: ["na"] })
  async negateart(msg: Message, _members: string): Promise<void> {
    msg.delete();
    const members: GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    const added: GuildMember[] = [];
    const removed: GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(NEGOTATIONS.ART)) {
        member.roles.remove(NEGOTATIONS.ART);
        removed.push(member);
      } else {
        member.roles.add(NEGOTATIONS.ART);
        added.push(member);
      }
    }
    const codeblock = [
      "```diff",
      ...added.map(r => `+ ${r.user.tag}`),
      ...removed.map(r => `- ${r.user.tag}`),
      "```"
    ].join("\n");
    await msg.channel.send(["**SUCCESS**: Art negations have been executed for the specified users.", codeblock].join("\n"), { split: true });
  }

  @command({ inhibitors: [inhibitors.moderatorOnly], group: "Permission Negations", args: [new Remainder(String)], aliases: ["nr"] })
  async negatereaction(msg: Message, _members: string): Promise<void> {
    msg.delete();
    const members: GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    const added: GuildMember[] = [];
    const removed: GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(NEGOTATIONS.REACTIONS)) {
        member.roles.remove(NEGOTATIONS.REACTIONS);
        removed.push(member);
      } else {
        member.roles.add(NEGOTATIONS.REACTIONS);
        added.push(member);
      }
    }
    const codeblock = [
      "```diff",
      ...added.map(r => `+ ${r.user.tag}`),
      ...removed.map(r => `- ${r.user.tag}`),
      "```"
    ].join("\n");
    await msg.channel.send(["**SUCCESS**: Reaction negations have been executed for the specified users.", codeblock].join("\n"), { split: true });
  }

  @command({ inhibitors: [inhibitors.moderatorOnly], group: "Permission Negations", args: [new Remainder(String)], aliases: ["nm"] })
  async negatemedia(msg: Message, _members: string): Promise<void> {
    msg.delete();
    const members: GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    const added: GuildMember[] = [];
    const removed: GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(NEGOTATIONS.MEDIA)) {
        member.roles.remove(NEGOTATIONS.MEDIA);
        removed.push(member);
      } else {
        member.roles.add(NEGOTATIONS.MEDIA);
        added.push(member);
      }
    }
    const codeblock = [
      "```diff",
      ...added.map(r => `+ ${r.user.tag}`),
      ...removed.map(r => `- ${r.user.tag}`),
      "```"
    ].join("\n");
    await msg.channel.send(["**SUCCESS**: Media negations have been executed for the specified users.", codeblock].join("\n"), { split: true });
  }

  @command({ inhibitors: [inhibitors.moderatorOnly], group: "Permission Negations", args: [new Remainder(String)], aliases: ["ne"] })
  async negateexperience(msg: Message, _members: string): Promise<void> {
    msg.delete();
    const members: GuildMember[] = [];
    for await (const _member of _members.split(" ")) members.push(await guildMemberParser(_member, msg));
    const added: GuildMember[] = [];
    const removed: GuildMember[] = [];
    for await (const member of members) {
      if (member.roles.cache.has(NEGOTATIONS.EXPERIENCE)) {
        member.roles.remove(NEGOTATIONS.EXPERIENCE);
        removed.push(member);
      } else {
        member.roles.add(NEGOTATIONS.EXPERIENCE);
        added.push(member);
      }
    }
    const codeblock = [
      "```diff",
      ...added.map(r => `+ ${r.user.tag}`),
      ...removed.map(r => `- ${r.user.tag}`),
      "```"
    ].join("\n");
    await msg.channel.send(["**SUCCESS**: Experience negations have been executed for the specified users.", codeblock].join("\n"), { split: true });
  }
}