import { Snowflake } from "discord.js";
import { Giveaway } from "../database/models";
import { scheduler, Embed, ROLES, getDuration } from "..";
import { client } from "../../..";
import { TextChannel } from "discord.js";
import { emotes } from "../constants";
import { strings } from "../messages";

export interface GiveawayArgs {
  startTime: number,
  duration: number,
  channelId: Snowflake,
  giveawayId: string,
  endTime: number
}

export default async function (args: GiveawayArgs): Promise<void> {
  // Get the current timestamp.
  const timestamp = Math.round(Date.now());
  const _timestamp = Math.round(Date.now() / 1000);
  // Get the start timestamp
  const startTimestamp = Math.round(args.startTime / 1000);

  const duration = Math.round(args.duration / 1000);
  const timeRemaining = (startTimestamp + duration) - _timestamp;

  const giveaway = await Giveaway.findOne({ where: { id: args.giveawayId } });
  if (!giveaway) return;
  if (giveaway.ended) return;

  if (0 >= timeRemaining) {
    await handleGiveawayWin(args, giveaway);
    return;
  }

  await editEmbed(args, giveaway);

  if (timeRemaining > 3600) {
    // More than 1 hour before the giveaway ends
    scheduler.newEvent("../GiveawayManager", 3600, args);
  } else if (timeRemaining > 600) {
    // More than 10 minutes before the giveaway ends
    scheduler.newEvent("../GiveawayManager", 600, args);
  } else if (timeRemaining > 60) {
    // More than 1 minute before the giveaway ends
    scheduler.newEvent("../GiveawayManager", 60, args);
  } else if (timeRemaining > 10) {
    // More than 10 seconds before the giveaway ends
    scheduler.newEvent("../GiveawayManager", 10, args);
  } else {
    // Run each second
    scheduler.newEvent("../GiveawayManager", 1, args);
  }
};

const handleNoWinner = async (args: GiveawayArgs, giveaway: Giveaway) => {
  const embed = new Embed()
    .setColor("#36393F")
    .setAuthor(giveaway.prize)
    .setFooter(strings.giveaway.embed.footerEnded(giveaway.winners))
    .setTimestamp(new Date(args.startTime + giveaway.duration))
    .setDescription(strings.giveaway.embed.noWinner);
  const channel = await client.channels.fetch(args.channelId) as TextChannel;
  const guild = await channel.guild.fetch();
  const message = await channel.messages.fetch(giveaway.messageId);

  await channel.send(strings.giveaway.noWinner(giveaway.prize));

  await message.edit(strings.giveaway.embed.giveawayEndedHeader, { embed: embed });
};

export const handleGiveawayWin = async (args: GiveawayArgs, giveaway: Giveaway): Promise<void> => {
  const embed = new Embed()
    .setColor("#36393F");
  const channel = await client.channels.fetch(args.channelId) as TextChannel;
  const guild = await channel.guild.fetch();
  const message = await channel.messages.fetch(giveaway.messageId);
  const reaction = message.reactions.resolve(emotes.giveaway.giftreactionid);
  const __users = await reaction.users.fetch();
  const users = __users
    .filter(u => u.bot === false)
    .filter(u => u.id !== client.user.id)
    .filter(u => !guild.members.resolve(u).roles.cache.find(r => r.name === "Muted"))
    .random(giveaway.winners)
    .filter(u => u);


  giveaway.ended = true;
  await giveaway.save();

  if (users.length === 0) return handleNoWinner(args, giveaway);

  embed
    .setAuthor(giveaway.prize)
    .setDescription(strings.giveaway.embed.winners(users.map(user => `→ ${user} (\`${user.id}\`)`).join("\n")))
    .setTimestamp(new Date(args.startTime + giveaway.duration))
    .setFooter(strings.giveaway.embed.footerEnded(giveaway.winners));

  await message.edit(strings.giveaway.embed.giveawayEndedHeader, { embed: embed });

  await channel.send(strings.giveaway.winners(users.map(user => user).join(", "), giveaway.prize, `https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`));
};

const editEmbed = async (args: GiveawayArgs, giveaway: Giveaway) => {
  const channel = await client.channels.fetch(args.channelId) as TextChannel;
  const message = await channel.messages.fetch(giveaway.messageId);
  if (!message) {
    giveaway.ended = true;
    await giveaway.save();
    return;
  }
  // Create the embed.
  const embed = new Embed()
    .setAuthor(giveaway.prize)
    .setDescription(strings.giveaway.embed.description(getDuration(args.startTime + giveaway.duration - Date.now())))
    .setFooter(strings.giveaway.embed.footer(giveaway.winners))
    .setTimestamp(new Date(args.startTime + giveaway.duration));

  // Edit the message.
  await message.edit(strings.giveaway.embed.giveawayHeader, { embed: embed });
};
