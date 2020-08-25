
import dotenv from "dotenv";
dotenv.config();

import "module-alias/register";
import "@lib/utils/types/discord";

import EventModule from "@modules/EventModule";
import { ErisClient } from "@lib/utils";
import UtilCommandModule from "@modules/UtilCommands";
import DonationCommandsModule from "@modules/DonationCommands";
import DirectMessageModule from "@modules/DirectMessageModule";
import ListenerMonitorInit from "@modules/ListenerMonitorInit";
import PermissionsModule from "@modules/PermissionsModule";
import LoggingModule from "@modules/LoggingModule";
import EmojiModule from "@modules/EmojiModule";
import HelpModule from "@modules/HelpModule";

const client = new ErisClient({
  botAdmins: [
    "209609796704403456", // Stijn
    "369497100834308106", // Ace
  ],
});

client
  .registerModule(ListenerMonitorInit)
  .registerModule(EventModule)
  .registerModule(UtilCommandModule)
  .registerModule(DonationCommandsModule)
  .registerModule(DirectMessageModule)
  .registerModule(PermissionsModule)
  .registerModule(LoggingModule)
  .registerModule(EmojiModule)
  .registerModule(HelpModule)
  .login(process.env.DISCORD_TOKEN);