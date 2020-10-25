/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { env } from "@utils/constants";

export default {
  unknownCategory: "**UNKNOWN CATEGORY**",
  specificCommandHelp: `To get more information about a specific command, run \`${env.PREFIX}help [command]\`.`,
  noPermission: "I cannot retrieve additional information about this command as you do not satisfy its permission criteria.",
  noCommandFound: "No command exists with that name or alias. Please reinspect its spelling, as that may be a potential factor as to why it cannot be resolved.",
  noArgumentsNeeded: "No arguments need to be either mandatorily or optionally provided for this command.",
  noAliases: "No aliases exist for this command.",
  noDescription: "A description has not been specified for this command."
};
