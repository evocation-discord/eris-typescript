import ArgTextProcessor from "@utils/arguments/ArgumentProcessor";
import { getArgumentParser } from "@utils/arguments/Arguments";
import { ErisClient, RedisClient } from "@utils/client";
import { escapeRegex } from "@utils/constants/regex";
import { Blacklist, DisabledCommand } from "@utils/database/models";
import { errorMessage, strings } from "@utils/messages";
import { Module } from "@utils/modules";
import { monitor } from "@utils/monitor";
import Discord from "discord.js";

export class CommandParserModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @monitor({ event: "message" })
  async onMessage(msg: Discord.Message): Promise<Discord.Message|void> {
    if (msg.author && msg.author.bot) return;

    const prefix = process.env.PREFIX;
    const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(msg.content)) return;

    const [, matchedPrefix] = msg.content.match(prefixRegex);

    const noPrefix = msg.content.slice(matchedPrefix.length).trim();
    const stringArgs: string[] = noPrefix.split(" ").slice(1) || [];
    const cmdTrigger = noPrefix.split(" ")[0].toLowerCase();
    const cmd = this.client.commandManager.getByTrigger(cmdTrigger);
    if (!cmd) return;

    if (await DisabledCommand.findOne({ where: { commandName: cmd.triggers[0] } })) return errorMessage(msg, strings.general.error(strings.general.commandDisabled));

    // blacklists, woohoo
    const roleBlacklists = await Blacklist.find({ where: { type: "role" } });
    const userBlacklists = await Blacklist.find({ where: { type: "user" } });
    if (userBlacklists.find((u) => u.id === msg.author.id)) return;
    if (roleBlacklists.find((r) => msg.member.roles.cache.has(r.id))) return;

    for await (const inhibitor of cmd.inhibitors) {
      const reason = await inhibitor(msg, cmd);
      if (reason) {
        // It inhibited
        if (reason === "Silent") return;
        errorMessage(msg, strings.general.error(reason));
        return;
      }
    }
    const processor = new ArgTextProcessor(stringArgs);
    const args: unknown[] = [];
    for await (const cmdArg of cmd.args || []) {
      const parser = getArgumentParser(cmdArg);
      try {
        // Process the argument.
        const p = await parser(processor, msg);
        if (p.length === 1) args.push(p[0]);
        else if (p.length === 0) args.push(undefined);
        else args.push(p);
      } catch (err) {
        const error = err as Error;
        // Return a error.
        try {
          if (await RedisClient.get(`user:${msg.author.id}:command:${cmd.triggers[0]}`)) {
            await RedisClient.del(`user:${msg.author.id}:command:${cmd.triggers[0]}`);
          }
          return errorMessage(msg, strings.general.error(strings.general.commandSyntaxError(`${prefix}${cmdTrigger} ${cmd.usage}`, error.message)));
        } catch (_) {
          // Do nothing. The user doesn't have the correct arguments.
          return;
        }
      }
    }

    // Executing the command
    try {
      const result = cmd.func.call(
        cmd.module,
        msg,
        ...args
      );
      if (result instanceof Promise) {
        await result;
      }
    } catch (err) {
      console.error(
        `error while executing command ${cmd.id} executed by ${msg.author.tag}/${msg.author.id} in guild ${msg.guild?.name}/${msg.guild?.id}\n`,
        err
      );
      if (await RedisClient.get(`user:${msg.author.id}:command:${cmd.triggers[0]}`)) {
        await RedisClient.del(`user:${msg.author.id}:command:${cmd.triggers[0]}`);
      }
      errorMessage(msg, strings.general.error(strings.general.somethingWentWrong));
    }
  }
}
