import { Snowflake } from "discord.js";
import { Giveaway } from "../database/models";
import { scheduler, Embed, ROLES, getDuration } from "..";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { client } from "../../..";
import { TextChannel } from "discord.js";
import { emotes } from "../constants";

export interface GiveawayArgs {
  startTime: number,
  duration: number,
  channelId: Snowflake,
  giveawayId: string,
  endTime: number
}

export default async (args: GiveawayArgs): Promise<void> => {
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
  const embed = Embed
    .setColor("#36393F")
    .setFooter(`${giveaway.winners} Winner(s) | Ended on`)
    .setDescription(`${client.emojis.resolve(emotes.UNCATEGORISED.DENIAL)} **EXECUTION FAILURE**: A winner was not able to be determined.`);
  const channel = await client.channels.fetch(args.channelId) as TextChannel;
  const guild = await channel.guild.fetch();
  const message = await channel.messages.fetch(giveaway.messageId);

  await channel.send(`Nobody won **${giveaway.prize}**. Maybe next time...`);

  await message.edit(`${message.client.emojis.resolve(emotes.GIVEAWAYS.GIFT_MESSAGE)} **GIVEAWAY ENDED** ${message.client.emojis.resolve(emotes.GIVEAWAYS.GIFT_MESSAGE)}`, { embed: embed });
};

export const handleGiveawayWin = async (args: GiveawayArgs, giveaway: Giveaway): Promise<void> => {
  const embed = Embed
    .setColor("#36393F");
  const channel = await client.channels.fetch(args.channelId) as TextChannel;
  const guild = await channel.guild.fetch();
  const message = await channel.messages.fetch(giveaway.messageId);
  const reaction = message.reactions.resolve(emotes.GIVEAWAYS.GIFT_REACTION);
  const __users = await reaction.users.fetch();
  const users = __users
    .filter(u => u.bot === false)
    .filter(u => u.id !== client.user.id)
    .random(giveaway.winners)
    .filter(u => u);


  giveaway.ended = true;
  await giveaway.save();

  if (users.length === 0) return handleNoWinner(args, giveaway);

  embed.setDescription([
    "**WINNER(S)**",
    users.map(user => `→ ${user} (\`${user.id}\`)`).join("\n"),
    "\nIf there are any complications in the delivery of the prize or an illegitimacy was identified, this prize may be rerolled."
  ].join("\n"));
  embed.setFooter(`${giveaway.winners} Winner(s) | Ended on`);

  await message.edit(`${message.client.emojis.resolve(emotes.GIVEAWAYS.GIFT_MESSAGE)} **GIVEAWAY ENDED** ${message.client.emojis.resolve(emotes.GIVEAWAYS.GIFT_MESSAGE)}`, { embed: embed });

  await channel.send(`Congratulations ${users.map(user => user).join(", ")}! You have won **${giveaway.prize}**. Please send a Direct Message to <@747105315840983212> with this message link to redeem your prize: <https://discord.com/channels/${guild.id}/${channel.id}/${message.id}>. If we do not hear from you within **24** hours of this message being sent, the prize will be rerolled.`);
};

const editEmbed = async (args: GiveawayArgs, giveaway: Giveaway) => {
  const channel = await client.channels.fetch(args.channelId) as TextChannel;
  const message = await channel.messages.fetch(giveaway.messageId);
  // Create the embed.
  const embed = Embed
    .setAuthor(giveaway.prize)
    .setDescription([
      "React with <:giftreaction:737019540495663276> to enter!\n",
      `**TIME REMAINING**: ${getDuration(args.startTime + giveaway.duration - Date.now())}\n`,

      `You __**MUST**__ have the **<@&${ROLES.MALLORN}>** role or above to enter giveaways. If you attempt to enter this giveaway without being Level 3 or above, your entrance will be nullified.`
    ].join("\n"))
    .setFooter(`${giveaway.winners} Winner(s) | Ends at`)
    .setTimestamp(new Date(args.startTime + giveaway.duration));

  // Edit the message.
  await message.edit(`${message.client.emojis.resolve(emotes.GIVEAWAYS.GIFT_MESSAGE)} **GIVEAWAY** ${message.client.emojis.resolve(emotes.GIVEAWAYS.GIFT_MESSAGE)}`, { embed: embed });
};