import { Module } from "@utils/modules";
import { ClientEvents } from "discord.js";

export interface Monitor {
    id: string,
    module: Module,
    func: Function,
    event: (keyof ClientEvents)
}