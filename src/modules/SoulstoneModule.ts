import {
  PlantedSoulstones, Soulstone, SoulstoneGenerationChannel, SoulstoneShopItem
} from "@database/models";
import * as Arguments from "@utils/arguments";
import { RedisClient } from "@utils/client";
import { command, CommandCategories } from "@utils/commands";
import { emotes, env } from "@utils/constants";
import { escapeRegex } from "@utils/constants/regex";
import { cron } from "@utils/cron";
import Embed from "@utils/embed";
import { inhibitors } from "@utils/inhibitors/Inhibitor";
import messages, { commandDescriptions } from "@utils/messages";
import { Module } from "@utils/modules";
import { monitor } from "@utils/monitor";
import Discord from "discord.js";

export default class SoulstoneModule extends Module {
  @monitor({ event: "message" })
  async onMessage(message: Discord.Message): Promise<void> {
    if (message.channel.type === "dm") return;
    if (message.guild.id !== env.MAIN_GUILD_ID) return;
    if (message.author.bot) return;

    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(process.env.PREFIX)})\\s*`);
    if (prefixRegex.test(message.content)) return;

    if (!await SoulstoneGenerationChannel.findOne({ where: { channel: message.channel.id } })) return;
    if (await RedisClient.get(`soulstone-generation:${message.channel.id}`)) return;
    const num = getRandomInt(1, 101) + 0.1 * 100;
    if (num > 100) {
      const code = Math.floor(Math.random() * 16777215).toString(16);
      const dropAmount = getRandomInt(5, 21);
      const msg = await message.channel.send(messages.modules.soulstones.generationMessage(dropAmount, code));
      await PlantedSoulstones.create({
        soulstones: dropAmount, code, message: msg.id, channel: msg.channel.id
      }).save();
    }
  }

  @command({
    group: CommandCategories.Soulstones, inhibitors: [inhibitors.botMaintainersOnly, inhibitors.guildsOnly], admin: true, description: commandDescriptions.gc, usage: "[channel:channel]", args: [new Arguments.Optional(Discord.TextChannel)]
  })
  async gc(message: Discord.Message, channel?: Discord.TextChannel): Promise<void> {
    if (!channel) channel = message.channel as Discord.TextChannel;
    if (await SoulstoneGenerationChannel.findOne({ where: { channel: channel.id } })) {
      const gc = await SoulstoneGenerationChannel.findOne({ where: { channel: channel.id } });
      await gc.remove();
      await message.channel.send(messages.general.success(messages.modules.soulstones.commands.gc.disabled(channel)));
    } else {
      await SoulstoneGenerationChannel.create({ channel: channel.id }).save();
      await message.channel.send(messages.general.success(messages.modules.soulstones.commands.gc.enabled(channel)));
    }
  }

  @command({
    group: CommandCategories.Soulstones, description: commandDescriptions.collect, usage: "<code:string>", args: [String]
  })
  async collect(message: Discord.Message, code: string): Promise<void> {
    await message.delete();
    const planted = await PlantedSoulstones.findOne({ where: { code } });
    if (!planted) return;
    let user = await Soulstone.findOne({ where: { id: message.author.id } });
    if (!user) user = await Soulstone.create({ id: message.author.id }).save();
    user.soulstones += planted.soulstones;
    await user.save();
    await planted.remove();
    const msg = await message.channel.send(messages.modules.soulstones.commands.collect.claim(message.author, planted.soulstones));
    msg.delete({ timeout: 5000 });
    await (msg.client.channels.resolve(planted.channel) as Discord.TextChannel).messages.delete(planted.message);
  }

  @cron({ cronTime: "0 */6 * * *" })
  async eachSixHourSoulstoneJob(): Promise<void> {
    const guild = this.client.guilds.resolve(env.MAIN_GUILD_ID);
    const members = await guild.members.fetch();
    const scionsofElysiumMembers = members.filter((member) => member.roles.cache.has(env.ROLES.SCIONS_OF_ELYSIUM)).array();
    for await (const member of scionsofElysiumMembers) {
      let soulstoneData = await Soulstone.findOne({ where: { id: member.user.id } });
      if (!soulstoneData) soulstoneData = await Soulstone.create({ id: member.user.id }).save();
      soulstoneData.soulstones += 75;
      await soulstoneData.save();
    }
  }

  @cron({ cronTime: "0 */5 * * *" })
  async eachFiveHourSoulstoneJob(): Promise<void> {
    const guild = this.client.guilds.resolve(env.MAIN_GUILD_ID);
    const members = await guild.members.fetch();
    const sentriesofDescensusMembers = members.filter((member) => member.roles.cache.has(env.ROLES.SENTRIES_OF_DESCENSUS)).array();
    for await (const member of sentriesofDescensusMembers) {
      let soulstoneData = await Soulstone.findOne({ where: { id: member.user.id } });
      if (!soulstoneData) soulstoneData = await Soulstone.create({ id: member.user.id }).save();
      soulstoneData.soulstones += 175;
      await soulstoneData.save();
    }

    const wisteriaMembers = members.filter((member) => member.roles.cache.has(env.ROLES.EOS)).array();
    for await (const member of wisteriaMembers) {
      let soulstoneData = await Soulstone.findOne({ where: { id: member.user.id } });
      if (!soulstoneData) soulstoneData = await Soulstone.create({ id: member.user.id }).save();
      soulstoneData.soulstones += 500;
      await soulstoneData.save();
    }
  }

  @command({
    group: CommandCategories.Soulstones, description: commandDescriptions.soulstoneleaderboard, aliases: ["slb"], inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands]
  })
  async soulstoneleaderboard(msg: Discord.Message): Promise<void> {
    let soulstoneData = await Soulstone.find();
    soulstoneData = soulstoneData.sort((a, b) => b.soulstones - a.soulstones);
    soulstoneData = soulstoneData.slice(0, 10);

    const message: string[] = [messages.modules.soulstones.commands.leaderboard.header];

    for await (const data of soulstoneData) {
      const user = await msg.client.users.fetch(data.id);
      const info = await userInfo(user);
      message.push(messages.modules.soulstones.commands.leaderboard.row(info.rank, user, info.soulstones));
    }
    await msg.channel.send(message.join("\n"), { allowedMentions: { users: [] } });
  }

  @command({
    group: CommandCategories.Soulstones, description: commandDescriptions.redeeminducements, aliases: ["ri"], inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands, inhibitors.userCooldown(21600000, false)]
  })
  async redeeminducements(message: Discord.Message): Promise<void> {
    let soulstoneData = await Soulstone.findOne({ where: { id: message.author.id } });
    if (!soulstoneData) soulstoneData = await Soulstone.create({ id: message.author.id }).save();
    soulstoneData.soulstones += 25;
    await soulstoneData.save();
    await message.channel.send(messages.general.success(messages.modules.soulstones.commands.redeeminducements.success));
  }

  @command({
    group: CommandCategories.Soulstones, description: commandDescriptions.soulstones, aliases: ["s", "ss"], inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], usage: "[user:user]", args: [new Arguments.Optional(Discord.User)]
  })
  async soulstones(message: Discord.Message, user = message.author): Promise<void> {
    let soulstoneData = await Soulstone.findOne({ where: { id: user.id } });
    if (!soulstoneData) soulstoneData = await Soulstone.create({ id: user.id }).save();
    await message.channel.send(messages.modules.soulstones.commands.soulstones.success(user, soulstoneData.soulstones));
  }

  @command({
    group: CommandCategories.Soulstones, description: commandDescriptions.awardsoulstones, aliases: ["awardss"], inhibitors: [inhibitors.botMaintainersOnly], usage: "<user:user> <amount:number>", args: [Arguments.User, Number]
  })
  async awardsoulstones(message: Discord.Message, user: Discord.User, amount: number): Promise<void> {
    const guild = this.client.guilds.resolve(env.MAIN_GUILD_ID);
    let soulstoneData = await Soulstone.findOne({ where: { id: user.id } });
    if (!soulstoneData) soulstoneData = await Soulstone.create({ id: user.id }).save();
    soulstoneData.soulstones += amount;
    await soulstoneData.save();
    await message.channel.send(messages.modules.soulstones.commands.awardsoulstones.success(user, amount, soulstoneData.soulstones));
    const channel = guild.channels.resolve(env.CHANNELS.SOULSTONE_LOG) as Discord.TextChannel;
    channel.send(messages.modules.soulstones.commands.awardsoulstones.log(message.author, user, amount));
  }

  @command({
    group: CommandCategories.Soulstones, description: commandDescriptions.deductsoulstones, aliases: ["deductss"], inhibitors: [inhibitors.botMaintainersOnly], usage: "<user:user> <amount:number>", args: [Arguments.User, Number]
  })
  async deductsoulstones(message: Discord.Message, user: Discord.User, amount: number): Promise<void> {
    const guild = this.client.guilds.resolve(env.MAIN_GUILD_ID);
    let soulstoneData = await Soulstone.findOne({ where: { id: user.id } });
    if (!soulstoneData) soulstoneData = await Soulstone.create({ id: user.id }).save();
    soulstoneData.soulstones -= amount;
    if (soulstoneData.soulstones < amount) {
      await messages.errors.errorMessage(message, messages.errors.error(messages.modules.soulstones.commands.deductsoulstones.error));
    } else {
      await soulstoneData.save();
      await message.channel.send(messages.modules.soulstones.commands.deductsoulstones.success(user, amount, soulstoneData.soulstones));
      const channel = guild.channels.resolve(env.CHANNELS.SOULSTONE_LOG) as Discord.TextChannel;
      channel.send(messages.modules.soulstones.commands.deductsoulstones.log(message.author, user, amount));
    }
  }

  @command({
    group: CommandCategories.Soulstones, aliases: ["sshop"], inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands]
  })
  async soulstoneshop(message: Discord.Message): Promise<void> {
    const items = await SoulstoneShopItem.find();
    const embed = new Embed().setTitle(`${emotes.commandresponses.soulstones} Soulstone Shop`);
    for await (const [index, item] of items.entries()) {
      let text = `You will get the **${item.data}**.${typeof item.buyableAmount === "number" ? ` This item is limited; **${item.buyableAmount}** left.` : ""}`;
      if (item.type === "role") text = `You will get the **<@&${item.data}>** role.${typeof item.buyableAmount === "number" ? ` This item is limited; **${item.buyableAmount}** left.` : ""}`;
      embed.addField(`#${index + 1} - ${item.cost}${emotes.commandresponses.soulstones}`, text, true);
    }
    message.channel.send(embed);
  }

  @command({
    group: CommandCategories.Soulstones, aliases: ["sbuy"], inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands, inhibitors.guildsOnly], usage: "<item:number>", args: [Number]
  })
  async soulstonebuy(message: Discord.Message, itemNumber: number): Promise<void> {
    const roleArray = [
      env.ROLES.CHRONOS,
      env.ROLES.ORION,
      env.ROLES.SCIONS_OF_ELYSIUM,
      env.ROLES.SENTRIES_OF_DESCENSUS
    ];
    const guild = this.client.guilds.resolve(env.MAIN_GUILD_ID);
    const items = await SoulstoneShopItem.find();
    const item = items[itemNumber - 1];
    if (!item) return messages.errors.errorMessage(message, messages.errors.error("This item does not exist."));
    let userSoulstones = await Soulstone.findOne({ where: { id: message.author.id } });
    if (!userSoulstones) userSoulstones = await Soulstone.create({ id: message.author.id }).save();
    if (typeof item.buyableAmount === "number" && item.buyableAmount === 0) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.notBuyableAnymore, 10000);
    if (userSoulstones.soulstones < item.cost) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.notEnoughSoulstones(item.cost - userSoulstones.soulstones), 10000);
    const member = guild.members.resolve(message.author);
    if (item.type === "role") {
      if (roleArray.includes(item.data)) {
        const indexOfItemUserTriesToBuy = roleArray.findIndex((r) => r === item.data);
        const itemBeforeThatRole = roleArray[indexOfItemUserTriesToBuy - 1];
        const role = guild.roles.resolve(item.data);
        if (!itemBeforeThatRole) {
          // Chronos
          if (member.roles.cache.filter((_role) => roleArray.includes(_role.id)).first() && (indexOfItemUserTriesToBuy < roleArray.findIndex((r) => r === member.roles.cache.filter((_role) => roleArray.includes(_role.id)).first().id))) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.role.alreadyhasRoleAboveThatRole(role), 10000);
          if (member.roles.cache.has(item.data)) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.role.alreadyHasThatRole, 10000);
          member.roles.add(role, messages.modules.soulstones.commands.buy.role.auditReasonAdd);
          message.channel.send(messages.modules.soulstones.commands.buy.role.purchase(role));
        } else {
          const soulstoneRoleUserHas = member.roles.cache.filter((_role) => roleArray.includes(_role.id)).first();
          if (!soulstoneRoleUserHas) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.role.cantBuyRoleThatIsNotDirectlyAboveTheirRole(guild.roles.resolve(item.data), guild.roles.resolve(itemBeforeThatRole)), 10000);
          if (member.roles.cache.has(item.data)) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.role.alreadyHasThatRole, 10000);
          if (indexOfItemUserTriesToBuy < roleArray.findIndex((r) => r === soulstoneRoleUserHas.id)) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.role.alreadyhasRoleAboveThatRole(role), 10000);
          if (!member.roles.cache.has(itemBeforeThatRole)) {
            const triedRole = guild.roles.resolve(item.data);
            const roleTheyNeed = guild.roles.resolve(itemBeforeThatRole);
            return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.role.cantBuyRoleThatIsNotDirectlyAboveTheirRole(triedRole, roleTheyNeed), 10000);
          }
          await member.roles.remove(soulstoneRoleUserHas, messages.modules.soulstones.commands.buy.role.auditReasonRemove);
          await member.roles.add(role, messages.modules.soulstones.commands.buy.role.auditReasonAdd);
          message.channel.send(messages.modules.soulstones.commands.buy.role.purchase(role));
        }
      } else {
        if (typeof item.buyableAmount === "number") {
          item.buyableAmount -= 1;
          await item.save();
        }
        const role = guild.roles.resolve(item.data);
        if (member.roles.cache.has(item.data)) return messages.errors.errorMessage(message, messages.modules.soulstones.commands.buy.role.alreadyHasThatRole, 10000);
        member.roles.add(role, messages.modules.soulstones.commands.buy.role.auditReasonAdd);
        message.channel.send(messages.modules.soulstones.commands.buy.role.purchase(role));
      }
      userSoulstones.soulstones -= item.cost;
      await userSoulstones.save();
    } else {
      userSoulstones.soulstones -= item.cost;
      if (typeof item.buyableAmount === "number") item.buyableAmount -= 1;
      await item.save();
      await userSoulstones.save();
      const channel = guild.channels.resolve(env.CHANNELS.SOULSTONE_LOG) as Discord.TextChannel;
      channel.send(messages.modules.soulstones.commands.buy.item.log(message.author, item));
      message.channel.send(messages.modules.soulstones.commands.buy.item.purchase(item));
    }
  }
}

const userInfo = async (user: Discord.User): Promise<{ soulstones: number; rank: number; }> => {
  let soulstoneData = await Soulstone.findOne({ where: { id: user.id } });
  if (!soulstoneData) soulstoneData = await Soulstone.create({ id: user.id }).save();
  let allData = await Soulstone.find();
  allData = allData.sort((a, b) => b.soulstones - a.soulstones);
  return {
    soulstones: soulstoneData.soulstones,
    rank: allData.findIndex((a) => a.id === user.id) + 1
  };
};

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
