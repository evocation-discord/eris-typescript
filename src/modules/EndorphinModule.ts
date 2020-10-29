import { ErisClient } from "@utils/client";
import { Module } from "@utils/modules";

export default class EndorphinModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }
}
