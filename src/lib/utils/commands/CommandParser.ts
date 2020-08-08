import { Message } from "discord.js";
import { Module } from "../modules/Module";
import { ErisClient } from "../client/ErisClient";
import { listener } from "../listener/decorator";
import { getArgumentParser, Greedy } from "../arguments/Arguments";
import ArgTextProcessor from "../arguments/ArgumentProcessor";

export class CommandParserModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @listener({ event: "message" })
  async onMessage(msg: Message): Promise<Message|void> {
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

    for (const inhibitor of cmd.inhibitors) {
      const reason = await inhibitor(msg, this.client);
      if (reason) {
        // It inhibited
        msg.channel.send(`${msg.author} | **COMMAND INHIBITED**: ${reason}`);
        return;
      }
    }
    const processor = new ArgTextProcessor(stringArgs);
    const args: unknown[] = [];
    for (const cmdArg of cmd.args || []) {
      const parser = getArgumentParser(cmdArg);
      try {
        // Process the argument.
        const p = await parser(processor, msg);
        if (p.length === 1 && !(cmdArg instanceof Greedy)) args.push(p[0]);
        else if (p.length === 0) args.push(undefined);
        else args.push(p);
      } catch (err) {
        // Return a error.
        try {
          return msg.channel.send((err as Error).message);
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
        `error while executing command ${cmd.id}! executed by ${msg.author.tag}/${msg.author.id} in guild ${msg.guild?.name}/${msg.guild?.id}\n`,
        err
      );
      cmd.onError(msg, err);
    }
  }
}

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");