import { Message } from "discord.js";
import { Module } from "../modules/Module";
import { Inhibitor } from "../inhibitors/Inhibitor";
import { supportedArgs } from "../arguments/supportedArgs";
import { Remainder, Optional } from "../arguments/Arguments";

export interface Command {
    func: Function,
    args?: (supportedArgs | Remainder | Optional)[],
    triggers: string[],
    id: string,
    description?: string,
    usage?: string,
    module: Module,
    inhibitors: Inhibitor[],
    group: string,
    staff?: boolean,
    admin?: boolean,
    onError: (msg: Message, error: Error) => void
}