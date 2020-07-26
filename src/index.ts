import 'module-alias/register';
import "@lib/utils/types/discord";

import dotenv from "dotenv";
import EventModule from "@modules/EventModule";
import { ErisClient } from "@lib/utils";
import UtilCommandModule from '@modules/UtilCommands';
import DonationCommandsModule from '@modules/DonationCommands';
dotenv.config();

const client = new ErisClient({
  botAdmins: [
    "209609796704403456", // Stijn
    "369497100834308106", // Ace
  ],
});

client
  .registerModule(EventModule)
  .registerModule(UtilCommandModule)
  .registerModule(DonationCommandsModule)
  .login(process.env.DISCORD_TOKEN);