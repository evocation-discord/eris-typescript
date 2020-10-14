/* eslint-disable @typescript-eslint/ban-types */
import { Module } from "@utils/modules";
import { Inhibitor } from "@utils/inhibitors";
import { supportedArgs } from "@utils/arguments/supportedArgs";
import * as Arguments from "@utils/arguments";
import { CommandCategories } from "@utils/commands";

export interface Command {
    func: Function,
    args?: (supportedArgs | Arguments.Remainder | Arguments.Optional)[],
    triggers: string[],
    id: string,
    description?: string,
    usage?: string,
    module: Module,
    inhibitors: Inhibitor[],
    group: CommandCategories,
    staff?: boolean,
    admin?: boolean
}
