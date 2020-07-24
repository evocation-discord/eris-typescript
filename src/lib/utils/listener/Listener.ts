import { Module } from "../modules/Module";
import { ClientEvents } from "discord.js";

export interface Listener {
    event: keyof ClientEvents;
    id: string;
    module: Module;
    func: Function;
    wrapperFunc?: (...args: any[]) => void;
}