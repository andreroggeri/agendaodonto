import fetch from "node-fetch";
import { debugRequests } from "./vars";

export function makeRequest<T>(url: string, args: any) {
    return fetch(url, args)
        .catch((err) => {
            console.error(
                `[Request] Error ${url} ${JSON.stringify(args)} ${err}`
            );
            throw err;
        })
        .then((r) => {
            if (debugRequests) {
                console.log(
                    `[Request] Url: ${args.method} ${url} Status: ${r.status}`
                );
            }

            if (r.status > 299) {
                r.json().then(console.log);
                console.log(args);
                throw new Error(
                    `Request failed with status ${
                        r.status
                    }. Args: ${JSON.stringify(args)}`
                );
            }
            return r;
        })
        .then((r) => {
            console.log({ args });
            if (args.raw) {
                return r.text();
            } else {
                return r.json();
            }
        })
        .then((r) => {
            if (debugRequests) {
                console.log(`[Request] Response : ${JSON.stringify(r)}`);
            }

            return r as T;
        });
}
