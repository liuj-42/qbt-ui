// this follows the format that qbittorrent api uses
// with {base url}/APIName/methodName
import { send_qbt_request } from '$lib/server/utils.js';

export async function GET({ params, url, request }) {
	const [api, method] = [params.api, params.method];
	const endpoint = `${api}/${method}${url.search ? url.search : ''}`;
	const cookies = request.headers.get('cookie') ?? undefined;
	return send_qbt_request(endpoint, 'GET', {}, cookies);
}

export async function POST({ params, request, url }) {
	const [api, method] = [params.api, params.method];
	const body = request.body ? await request.json() : {};
	const endpoint = `${api}/${method}${url.search ? url.search : ''}`;
	const cookies = request.headers.get('cookie') ?? undefined;
	return send_qbt_request(endpoint, 'POST', body, cookies);
}
