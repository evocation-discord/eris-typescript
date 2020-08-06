import { Module } from "../modules/Module";

export interface Monitor {
    id: string,
    module: Module,
    func: Function
}