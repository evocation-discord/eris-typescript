import { command, commandDescriptions, cron, escapeRegex, getRandomInt, inhibitors, MAIN_GUILD_ID, Module, monitor, Optional, PV, strings } from "@lib/utils";
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

  @command({ inhibitors: [inhibitors.botAdminsOnly, inhibitors.guildsOnly], admin: true, description: commandDescriptions.gc, usage: "[channel:channel]", args: [new Optional(Discord.TextChannel)] })
  async gc(message: Discord.Message, channel?: Discord.TextChannel): PV<void> {
    if (!channel) channel = message.channel as Discord.TextChannel;
    if (await SoulstoneGenerationChannel.findOne({ where: { channel: channel.id } })) {
      const gc = await SoulstoneGenerationChannel.findOne({ where: { channel: channel.id } });
      await gc.remove();
      await message.channel.send(strings.modules.soulstones.commands.gc.disabled(channel));
    } else {
      await SoulstoneGenerationChannel.create({ channel: channel.id }).save();
      await message.channel.send(strings.modules.soulstones.commands.gc.enabled(channel));
    }
  }

  @command({ description: commandDescriptions.collect, usage: "<code:string>", args: [String] })
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
    console.log(this.client.user.username);
  }

  @cron({ cronTime: "0 */5 * * *" })
  async eachFiveHourSoulstoneJob(): PV<void> {
    console.log(this.client.user.username);
  }
}