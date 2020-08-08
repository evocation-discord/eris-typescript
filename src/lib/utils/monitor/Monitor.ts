import { Module } from "../modules/Module";
import { ClientEvents } from "discord.js";

export interface Monitor {
    id: string,
    module: Module,
    func: Function,
    events: (keyof ClientEvents)[]
}