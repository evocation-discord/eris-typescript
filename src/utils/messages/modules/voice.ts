/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { emotes } from "@utils/constants";

export default {
  joined: "Joined Evocation Voice",
  left: "Left Evocation Voice",
  deafMessage: (oldVoice: string, newVoice: string) => `${emotes.logging.members.updatemember} **MOVED**: You have been moved from **${oldVoice.toUpperCase()}** to **${newVoice.toUpperCase()}**. This is to ensure occupants of voice channels are actively contributing.`
};
