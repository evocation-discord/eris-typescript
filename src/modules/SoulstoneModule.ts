import { command, CommandCategories, commandDescriptions, cron, escapeRegex, getRandomInt, inhibitors, MAIN_GUILD_ID, Module, monitor, Optional, PV, ROLES, strings } from "@lib/utils";
import RedisClient from "@lib/utils/client/RedisClient";
import { PlantedSoulstones, Soulstone, SoulstoneGenerationChannel } from "@lib/utils/database/models";
import Discord from "discord.js";

export default class SoulstoneModule extends Module {

  @monitor({ event: "message" })
  async onMessage(message: Discord.Message): PV<void> {
    if (message.channel.type === "dm") return;
    if (message.guild.id !== MAIN_GUILD_ID) return;
    if (message.author.bot) return;

    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(process.env.PREFIX)})\\s*`);
    if (prefixRegex.test(message.content)) return;

    if (!await SoulstoneGenerationChannel.findOne({ where: { channel: message.channel.id } })) return;
    if (await RedisClient.get(`soulstone-generation:${message.channel.id}`)) return;
    const num = getRandomInt(1, 101) + 0.1 * 100;
    if (num > 100) {
      const code = Math.floor(Math.random() * 16777215).toString(16);
      const dropAmount = getRandomInt(5, 21);
      const msg = await message.channel.send(strings.modules.soulstones.generationMessage(dropAmount, code));
      await PlantedSoulstones.create({ soulstones: dropAmount, code: code, message: msg.id, channel: msg.channel.id }).save();
    }
  }

  @command({ group: CommandCategories["Soulstones"], inhibitors: [inhibitors.botAdminsOnly, inhibitors.guildsOnly], admin: true, description: commandDescriptions.gc, usage: "[channel:channel]", args: [new Optional(Discord.TextChannel)] })
  async gc(message: Discord.Message, channel?: Discord.TextChannel): PV<void> {
    if (!channel) channel = message.channel as Discord.TextChannel;
    if (await SoulstoneGenerationChannel.findOne({ where: { channel: channel.id } })) {
      const gc = await SoulstoneGenerationChannel.findOne({ where: { channel: channel.id } });
      await gc.remove();
      await message.channel.send(strings.general.success(strings.modules.soulstones.commands.gc.disabled(channel)));
    } else {
      await SoulstoneGenerationChannel.create({ channel: channel.id }).save();
      await message.channel.send(strings.general.success(strings.modules.soulstones.commands.gc.enabled(channel)));
    }
  }

  @command({ group: CommandCategories["Soulstones"], description: commandDescriptions.collect, usage: "<code:string>", args: [String] })
  async collect(message: Discord.Message, code: string): PV<void> {
    await message.delete();
    const planted = await PlantedSoulstones.findOne({ where: { code: code } });
    if (!planted) return;
    let user = await Soulstone.findOne({ where: { id: message.author.id } });
    if (!user) user = await Soulstone.create({ id: message.author.id }).save();
    user.soulstones += planted.soulstones;
    await user.save();
    await planted.remove();
    const msg = await message.channel.send(strings.modules.soulstones.commands.collect.claim(message.author, planted.soulstones));
    msg.delete({ timeout: 5000 });
    await (msg.client.channels.resolve(planted.channel) as Discord.TextChannel).messages.delete(planted.message);
  }

  @cron({ cronTime: "0 */6 * * *" })
  async eachSixHourSoulstoneJob(): PV<void> {
    const guild = this.client.guilds.resolve(MAIN_GUILD_ID);
    const members = await guild.members.fetch();
    const scionsofElysiumMembers = members.filter(member => member.roles.cache.has(ROLES.SCIONS_OF_ELYSIUM)).array();
    for await (const member of scionsofElysiumMembers) {
      let soulstoneData = await Soulstone.findOne({ where: { id: member.user.id } });
      if (!soulstoneData) soulstoneData = await Soulstone.create({ id: member.user.id }).save();
      soulstoneData.soulstones += 75;
      await soulstoneData.save();
    }
  }

  @cron({ cronTime: "0 */5 * * *" })
  async eachFiveHourSoulstoneJob(): PV<void> {
    const guild = this.client.guilds.resolve(MAIN_GUILD_ID);
    const members = await guild.members.fetch();
    const sentriesofDescensusMembers = members.filter(member => member.roles.cache.has(ROLES.SENTRIES_OF_DESCENSUS)).array();
    for await (const member of sentriesofDescensusMembers) {
      let soulstoneData = await Soulstone.findOne({ where: { id: member.user.id } });
      if (!soulstoneData) soulstoneData = await Soulstone.create({ id: member.user.id }).save();
      soulstoneData.soulstones += 175;
      await soulstoneData.save();
    }

    const wisteriaMembers = members.filter(member => member.roles.cache.has(ROLES.WISTERIA)).array();
    for await (const member of wisteriaMembers) {
      let soulstoneData = await Soulstone.findOne({ where: { id: member.user.id } });
      if (!soulstoneData) soulstoneData = await Soulstone.create({ id: member.user.id }).save();
      soulstoneData.soulstones += 500;
      await soulstoneData.save();
    }
  }

  @command({ group: CommandCategories["Soulstones"], description: commandDescriptions.soulstoneleaderboard, aliases: ["slb"] })
  async soulstoneleaderboard(msg: Discord.Message): PV<void> {
    const guild = msg.client.guilds.resolve(MAIN_GUILD_ID);
    let soulstoneData = await Soulstone.find();
    soulstoneData = soulstoneData.sort((a, b) => b.soulstones - a.soulstones);
    soulstoneData = soulstoneData.slice(0, 10);

    const message: string[] = [strings.modules.soulstones.commands.leaderboard.header];

    for await (const data of soulstoneData) {
      const user = await msg.client.users.fetch(data.id);
      const info = await userInfo(user);
      message.push(strings.modules.soulstones.commands.leaderboard.row(info.rank, user, info.soulstones));
    }
    await msg.channel.send(message.join("\n"), { allowedMentions: { users: [] } });
  }
}

const userInfo = async (user: Discord.User) => {
  let soulstoneData = await Soulstone.findOne({ where: { id: user.id } });
  if (!soulstoneData) soulstoneData = await Soulstone.create({ id: user.id }).save();
  let allData = await Soulstone.find();
  allData = allData.sort((a, b) => b.soulstones - a.soulstones);
  return {
    soulstones: soulstoneData.soulstones,
    rank: allData.findIndex(a => a.id === user.id) + 1
  };
};