import { monitor, Module, ErisClient, MAIN_GUILD_ID, levelConstants, strings } from "@lib/utils";
import { Message } from "discord.js";
import RedisClient from "@lib/utils/client/RedisClient";
import { UserXP, XPExclusion, LevelRole } from "@lib/utils/database/models";
import { User } from "discord.js";

export default class LevelModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  getRandomXP(): number {
    return Math.floor(Math.random() * 26) + 25;
  }

  @monitor({ event: "message" })
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.guild.id !== MAIN_GUILD_ID) return;

    // blacklists, woohoo
    const roleExclusions = await XPExclusion.find({ where: { type: "role" } });
    const channelExclusions = await XPExclusion.find({ where: { type: "user" } });
    if (channelExclusions.find(c => c.id === message.channel.id)) return;
    if (roleExclusions.find(r => message.member.roles.cache.has(r.id))) return;
    if (await RedisClient.get(`player:${message.author.id}:check`)) return;
    let user = await UserXP.findOne({ where: { id: message.author.id } });
    if (!user) user = await UserXP.create({ id: message.author.id }).save();

    user.xp += this.getRandomXP();
    await user.save();

    await this.levelRoleCheck(message, user.xp);

    // await RedisClient.set(`player:${message.author.id}:check`, "1", "ex", 60);
  }

  async levelRoleCheck(msg: Message, xp: number): Promise<void> {
    if (msg.member.roles.cache.find(r => r.name === "Muted")) return;
    const userLevel = levelConstants.getLevelFromXP(xp);
    let rolesData = await LevelRole.find();
    rolesData = rolesData.sort((a, b) => a.level - b.level);
    const roleData = rolesData.find(r => r.level === userLevel);
    if (!roleData) {
      const data = rolesData.filter(rr => rr.level < userLevel).reverse()[0];
      if (!data) return;
      const previousRole = rolesData[rolesData.indexOf(data) - 1] || null;
      if (previousRole) msg.member.roles.remove(previousRole.id, strings.modules.levels.auditlog.roleRemove).catch(_ => _);
      msg.member.roles.add(data.id, strings.modules.levels.auditlog.roleAdd);
    } else {
      const previousRole = rolesData[rolesData.indexOf(roleData) - 1] || null;
      if (previousRole) msg.member.roles.remove(previousRole.id, strings.modules.levels.auditlog.roleRemove).catch(_ => _);
      msg.member.roles.add(roleData.id, strings.modules.levels.auditlog.roleAdd);
    }
  }
}