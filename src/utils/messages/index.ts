import commandDescriptions from "./commandDescriptions";
import errors from "./errors";
import general from "./general";
import administrator from "./modules/administrator";
import affiliate from "./modules/affiliate";
import botmaintainer from "./modules/botmaintainer";
import events from "./modules/events";
import help from "./modules/help";
import levels from "./modules/levels";
import moderation from "./modules/moderation";
import purchaseableroles from "./modules/purchaseableroles";
import util from "./modules/util";
import voice from "./modules/voice";

export default {
  errors,
  general,
  modules: {
    administrator,
    affiliate,
    botmaintainer,
    events,
    help,
    levels,
    moderation,
    purchaseableroles,
    util,
    voice
  }
};

export {
  commandDescriptions
};
