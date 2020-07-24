import { Message } from "discord.js";
import { Module } from "../modules/Module";
import { ErisClient } from "../client/ErisClient";
import { listener } from "../listener/decorator";
import { getArgTypes } from "../argTypeProvider";
import { Context } from "../Context";

export class CommandParserModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }
  @listener({ event: "message" })
  async onMessage(msg: Message) {
    const prefix = process.env.PREFIX;

    if (msg.author && msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;

    const noPrefix = msg.content.replace(prefix, "");
    const stringArgs: string[] = noPrefix.split(" ").slice(1) || [];
    const cmdTrigger = noPrefix.split(" ")[0].toLowerCase();
    const cmd = this.client.commandManager.getByTrigger(cmdTrigger);
    if (!cmd) return;

    for (const inhibitor of cmd.inhibitors) {
      const reason = await inhibitor(msg, this.client);
      if (reason) {
        // It inhibited
        msg.reply(`:warning: command was inhibited: ${reason}`);
        return;
      }
    }
    // Argument type validation
    const typedArgs = [] as unknown[];
    const leastArgs =
      cmd.args.length - cmd.args.filter(x => x.optional).length;
    if (cmd.single) {
      typedArgs.push(stringArgs.join(" "));
    } else {
      if (stringArgs.length < leastArgs)
        return msg.reply(
          `:warning: expected atleast ${leastArgs} argument${
          leastArgs !== 1 ? "s" : ""
          } but got ${stringArgs.length} argument${
          stringArgs.length !== 1 ? "s" : ""
          } instead`
        );
      for (const i in stringArgs) {
        const sa = stringArgs[i];
        // Beware: arg is `unknown`
        const arg = getArgTypes(this.client)[cmd.args[i].type.name](
          sa,
          msg
        );
        if (arg === null || arg === undefined) {
          return msg.reply(
            `:warning: argument #${parseInt(i, 10) +
            1} is not of expected type ${cmd.args[i].type.name}`
          );
        } else typedArgs.push(arg);
      }
    }

    // Executing the command
    const context = new Context(msg, prefix, cmdTrigger, cmd);
    try {
      const result = cmd.func.call(
        cmd.module,
        cmd.usesContextAPI ? context : msg,
        ...typedArgs
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