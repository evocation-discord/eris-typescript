import request from "request";
import { promisify } from "util";

// eslint-disable-next-line func-names
export default async function (link: string): Promise<string> {
  try {
    const redirects: string[] = [];
    const res = await promisify(request)({
      url: link.startsWith("http") ? link : `http://${link}`,
      method: "GET",
      timeout: 3000
    });

    redirects.push(res.request.href);
    return redirects.filter((lnk, index, all) => {
      const last = index ? all[index - 1] : "";

      if (
        last.replace("http://", "https://") === lnk
        || last.replace("http://", "https://www.") === lnk
        || lnk.replace("www.", "") === last
      ) return false;

      return lnk;
    }).filter((lnk) => lnk)[0];
  } catch (error) {
    // TODO: error handling
    return link.startsWith("http") ? link : `http://${link}`;
  }
}
