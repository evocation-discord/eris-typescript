import request from "request";
import { promisify } from "util";

export default async function (link: string): Promise<string> {
  try {
    const redirects: string[] = [];
    const res = await promisify(request)({
      url: link.startsWith("http") ? link : `http://${link}`,
      method: "GET",
      timeout: 3000
    });

    redirects.push(res.request.href);
    return redirects.filter((link, index, all) => {
      const last = index ? all[index - 1] : "";

      if (
        last.replace("http://", "https://") === link ||
        last.replace("http://", "https://www.") === link ||
        link.replace("www.", "") === last
      ) return false;

      return link;
    }).filter(link => link)[0];
  } catch (error) {
    // TODO: error handling
    return link.startsWith("http") ? link : `http://${link}`;
  }
}