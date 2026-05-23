// this follows the format that qbittorrent api uses
// with {base url}/APIName/methodName
import { send_qbt_request } from '$lib/server/utils.js';

export async function GET({ params, url }) {
	const [api, method] = [params.api, params.method];

	const endpoint = `${api}/${method}${url.search ? url.search : ''}`;
	return send_qbt_request(endpoint, 'GET');
}

export async function POST({ params, request, url }) {
	const [api, method] = [params.api, params.method];
	const body = request.body ? await request.json() : {};

	const endpoint = `${api}/${method}${url.search ? url.search : ''}`;

	return send_qbt_request(endpoint, 'POST', body);
}
