import { Message } from "discord.js";
import { Module } from "../modules/Module";
import { ICommandArgument } from "./decorator";
import { Inhibitor } from "../inhibitors/Inhibitor";

export interface Command {
    func: Function;
    args: ICommandArgument[];
    triggers: string[];
    id: string;
    description?: string;
    module: Module;
    single: boolean;
    inhibitors: Inhibitor[];
    usesContextAPI: boolean;
    onError: (msg: Message, error: Error) => void;
}