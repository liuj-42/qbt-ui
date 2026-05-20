import { QBT_URL } from "./constants"

export async function send_qbt_request(endpoint: string, method: "GET" | "POST", body: object = {}) {
  // qbt api only supports get or post requests
  const URL = `${QBT_URL}/${endpoint.replace(/^\/+|\/+$/g, '')}`;
  // console.log(URL)
  return fetch(URL, {
    method,
    body: method == "GET" ? null : JSON.stringify(body),
    headers: {
      'Accept-Encoding': 'identity'
    }
  });
}