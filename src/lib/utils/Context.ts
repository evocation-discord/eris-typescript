import { Message } from "discord.js";
import { Command } from "./commands/Command";

export class Context {
    constructor(
        public msg: Message,
        public prefix: string,
        public trigger: string,
        public cmd: Command
    ) {}
}