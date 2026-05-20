<script lang="ts">
	import { onMount } from 'svelte';
	import { formatBytes } from '$lib/utils/bytes';
	const GRAPH_TIME = 15;

	interface TransferStats {
		lifetime: number;
		session: number;
		limit: number;
		speed: number[];
	}

	let uploadStats = $state<TransferStats>({ lifetime: 0, session: 0, limit: 0, speed: [] });
	let downloadStats = $state<TransferStats>({ lifetime: 0, session: 0, limit: 0, speed: [] });
	onMount(() => {
		const interval = setInterval(() => {
			// your function here
			getData();
		}, 1000);

		return () => clearInterval(interval);
		// getData();
	});

	function getData() {
		fetch('/qbt/transfer/info')
			.then((res) => res.json())
			.then((data) => {
				uploadStats.session = Math.max(data.up_info_data, uploadStats.session);
				uploadStats.limit = data.up_rate_limit;
				uploadStats.speed.push(data.up_info_speed);
				
				downloadStats.session = Math.max(data.dl_info_data, downloadStats.session);
				downloadStats.limit = data.dl_rate_limit;
				downloadStats.speed.push(data.dl_info_speed);
			});
		fetch('/qbt/sync/maindata')
			.then((res) => res.json())
			.then((data) => {
				uploadStats.lifetime = data.server_state.alltime_ul;
				downloadStats.lifetime = data.server_state.alltime_dl;
			});
	}
</script>

<div class="content">
	<h1>torrents overview</h1>

	<div class="grid">
		<div class="box tall">tall box - global stats</div>
		<div class="box">reg box 1 - upload graph</div>
		<div class="box">reg box 2 - download graph</div>
		<div class="box">reg box 3 - misc</div>
		<div class="box">
			<h4>upload stats</h4>
			<span>lifetime upload: {formatBytes(uploadStats.lifetime)} </span>
			<span>sesssion upload: {formatBytes(uploadStats.session)}</span>
			<span>upload limit: {formatBytes(uploadStats.limit)}</span>
			<span>{uploadStats.speed.slice(Math.max(0, uploadStats.speed.length - GRAPH_TIME)).map(num => formatBytes(num)+"/s")}</span>
		</div>
		<div class="box">
			<h4>download stats</h4>
			<span>lifetime download: {formatBytes(downloadStats.lifetime)}</span>
			<span>session download {formatBytes(downloadStats.session)}</span>
			<span>download limit: {formatBytes(downloadStats.limit)}</span>
			<span>{downloadStats.speed.slice(Math.max(0, downloadStats.speed.length - GRAPH_TIME)).map(num => formatBytes(num)+"/s")}</span>
		</div>
		<!-- <StatCard>reg box 4 - upload stats</StatCard>
		<StatCard>reg box 5 - download stats</StatCard> -->
		<div class="box">reg box 6 - misc</div>
	</div>
</div>

<style>
	.content {
		display: flex;
		width: 100%;
		flex-direction: column;
	}
	.grid {
		display: grid;
		flex-grow: 1;
		grid-template: repeat(2, 1fr) / repeat(4, 1fr);
		grid-gap: 12px;
		/*grid-template-columns: repeat(4, 1fr);*/
	}

	.box {
		padding: 16px;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		outline: 1px solid var(--accent);

		/* add these */
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		word-break: break-word;
	}

	.tall {
		grid-row: span 2;
	}
</style>
