import request from "request";
import { P } from "..";
export const linkResolver = (link: string): P<string> => new Promise(resolve => {
  const redirects = [];
  request({
    url: link.startsWith("http") ? link : `http://${link}`,
    method: "GET",
    timeout: 3000
  }, (err, res, body) => {
    if (err) return resolve(link.startsWith("http") ? link : `http://${link}`);
    redirects.push(res.request.href);
    resolve(redirects.filter((link, index, all) => {
      const last = index ? all[index - 1] : "";
      if (last.replace("http://", "https://") === link) return false;
      if (last.replace("http://", "https://www.") === link) return false;
      if (link.replace("www.", "") === last) return false;
      return link;
    }).filter(link => link)[0]);
  });
});