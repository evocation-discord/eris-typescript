import { Module } from "@utils/modules";
import Discord from "discord.js";

export interface Listener {
    event: keyof Discord.ClientEvents,
    id: string,
    module: Module,
    func: Function,
    wrapperFunc?: (...args: unknown[]) => void
}