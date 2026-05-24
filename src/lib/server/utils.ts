import { QBT_URL } from './constants';

export async function send_qbt_request(
	endpoint: string,
	method: 'GET' | 'POST',
  body: object = {},
	cookies?: string
) {
	// qbt api only supports get or post requests
	const URL = `${QBT_URL}/${endpoint.replace(/^\/+|\/+$/g, '')}`;
	return fetch(URL, {
		method,
		body: method == 'GET' ? null : JSON.stringify(body),
		headers: {
      'Accept-Encoding': 'identity',
		  ...(cookies ? { Cookie: cookies } : {})
		}
	});
}
