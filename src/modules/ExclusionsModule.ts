import { command, Module, ErisClient, Optional, regExpEsc, resolveUser, resolveRole, emotes, Remainder, ROLES, Embed, inhibitors } from "@lib/utils";
import { Message, Role, User } from "discord.js";
import { Blacklist } from "@database/models";

export default class ExclusionsModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @command({ inhibitors: [inhibitors.adminOnly], args: [new Optional(String), new Optional(new Remainder(String))], group: "Server Administrator", staff: true })
  async exclude(msg: Message, type?: "user" | "role", id?: string): Promise<void | Message> {
    if (msg.channel.type === "dm") return;
    if (!type || !id) return msg.channel.send("Incorrect command usage: `e!exclude <user|role> <ID/mention>`");
    if (type === "role") {
      if (!msg.member.roles.cache.has(ROLES.LEAD_ADMINISTRATORS)) return;
      const role = await roleParser(id, msg);
      if (typeof role === "string") return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: ${role}`);
      if (msg.member.roles.cache.has(role.id)) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: You cannot add that role as an exclusion as it would constitute your exclusion, too.`);
      await Blacklist.create({
        type: "role",
        id: role.id
      }).save();
      msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.SUCCESS)} **SUCCESS**: Executed exclusions for the specified role.`);
    } else if (type === "user") {
      const user = await userParser(id, msg);
      if (typeof user === "string") return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: ${user}`);
      if (user.id === msg.author.id) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: You cannot execute that command on yourself.`);
      await Blacklist.create({
        type: "user",
        id: user.id
      }).save();
      msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.SUCCESS)} **SUCCESS**: Executed exclusions for the specified user.`);
    } else return msg.channel.send("Incorrect command usage: `e!exclude [user|role] [ID/mention]`");
  }
  @command({ inhibitors: [inhibitors.adminOnly], group: "Server Administrator", args: [new Optional(String), new Optional(String), new Optional(new Remainder(String))], staff: true })
  async exclusions(msg: Message, what?: "remove" | "clear", type?: "user" | "role", id?: string): Promise<Message> {
    if (!what) {
      const roleBlacklists = await Blacklist.find({ where: { type: "role" } });
      const userBlacklists = await Blacklist.find({ where: { type: "user" } });
      const embed = Embed
        .addField("User Exclusion", userBlacklists.map(u => `→ <@${u.id}> (\`${u.id}\`)`).join("\n") || "→ No users excluded.")
        .addField("Role Exclusions", roleBlacklists.map(r => `→ **<@&${r.id}>** (\`${r.id}\`)`).join("\n") || "→ No roles excluded.");
      return msg.channel.send(embed);
    }
    if (!["remove", "clear"].includes(what)) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: Wrong command usage. \`e!exclusions [remove|clear] [user|role] [ID/mention]\``);

    if (what === "remove") {
      if (!type || !["user", "role"].includes(type) || !id) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: Wrong command usage. \`e!exclusions [remove|clear] [user|role] [ID/mention]\``);
      if (type === "role") {
        const blacklist = await Blacklist.findOne({ where: { id: id, type: "role" } });
        if (!blacklist) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: This role is not excluded.`);
        blacklist.remove();
        msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.SUCCESS)} **SUCCESS**: Updated exclusions for the specified role.`);
      } else if (type === "user") {
        const blacklist = await Blacklist.findOne({ where: { id: id, type: "user" } });
        if (!blacklist) return msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **COMMAND INHIBITED**: This role is not excluded.`);
        blacklist.remove();
        msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.SUCCESS)} **SUCCESS**: Updated exclusions for the specified user.`);
      }
    } else if (what === "clear") {
      const blacklists = await Blacklist.find();
      blacklists.forEach(b => b.remove());
      msg.channel.send(`${this.client.emojis.resolve(emotes.UNCATEGORISED.SUCCESS)} **SUCCESS**: Removed all exclusions.`);
    }
  }
}

const roleParser = async (arg: string, msg: Message) => {
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

  if (querySearch.length === 0) return "Role was not able to be resolved.";
  return querySearch[0];
};

const userParser = async (arg: string, msg: Message) => {
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

  if (querySearch.length === 0) return "User was not able to be resolved.";
  return querySearch[0];
};