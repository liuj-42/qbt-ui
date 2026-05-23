<!--
TODO:
global options:
- add toggle between bytes/bits
global stats:
- add network connection status: firewalled/connected/disconnected
- visual for space used / available w/ labels:
    pie chart? bar chart? some other plot? check chart.js available options
graphs:
- add default numbers for y axis
- label x axis
- add controls for graph
    - max time
    - graph style (btop graph settings)
component stuff:
- move graphs into their own components + figure out what to do with the create/update chart functions
- move the other things too, see if theres a slot or something to pass data through
styling:
- make it better 
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Filler
	} from 'chart.js';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);

	const GRAPH_TIME = 15;

	interface TransferStats {
		lifetime: number; // lifetime transfer amount
		session: number; // session transfer amount
		limit: number; // speed limit
		speed: number[]; // list of current speeds
		count: number; // number of active trasnfers
	}

	interface torrentInfo {
		dlspeed: number;
		eta: number;
		f_l_piece_prio: boolean;
		force_start: boolean;
		hash: string;
		category: string;
		name: string;
		num_complete: number;
		num_incomplete: number;
		num_leeches: number;
		num_seeds: number;
		priority: number;
		progress: number;
		ratio: number;
		seq_dl: boolean;
		size: number;
		state: torrentState;
		super_seeding: boolean;
		upspeed: number;
		isPrivate: boolean;
	}

	type torrentState =
		| 'error'
		| 'missingFiles'
		| 'uploading'
		| 'pausedUP'
		| 'queuedUP'
		| 'stalledUP'
		| 'checkingUP'
		| 'forcedUP'
		| 'allocating'
		| 'downloading'
		| 'metaDL'
		| 'pausedDL'
		| 'queuedDL'
		| 'stalledDL'
		| 'checkingDL'
		| 'forcedDL'
		| 'checkingResumeData'
		| 'moving'
		| 'unknown';

	let uploadStats = $state<TransferStats>({
		lifetime: 0,
		session: 0,
		limit: 0,
		speed: [],
		count: 0
	});
	let downloadStats = $state<TransferStats>({
		lifetime: 0,
		session: 0,
		limit: 0,
		speed: [],
		count: 0
	});

	let uploadCanvas: HTMLCanvasElement;
	let downloadCanvas: HTMLCanvasElement;
	let uploadChart: Chart;
	let downloadChart: Chart;

	function makeChart(canvas: HTMLCanvasElement, color: string): Chart {
		return new Chart(canvas, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						data: [],
						borderColor: color,
						backgroundColor: color + '33',
						fill: true,
						tension: 0.3,
						pointRadius: 0
					}
				]
			},
			options: {
				animation: false,
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: { display: false },
					y: {
						ticks: { callback: (v) => formatBytes(v as number) + '/s' }
					}
				},
				plugins: { legend: { display: false } }
			}
		});
	}

	function updateChart(chart: Chart, speed: number[]) {
		const slice = speed.slice(Math.max(0, speed.length - GRAPH_TIME));
		chart.data.labels = slice.map((_, i) => i);
		chart.data.datasets[0].data = slice;
		chart.update('none');
	}

	onMount(() => {
		uploadChart = makeChart(uploadCanvas, '#4ade80');
		downloadChart = makeChart(downloadCanvas, '#60a5fa');

		getData();
		const interval = setInterval(getData, 1000);
		return () => {
			clearInterval(interval);
			uploadChart.destroy();
			downloadChart.destroy();
		};
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

				// prune speed list
				uploadStats.speed = uploadStats.speed.slice(-GRAPH_TIME * 10);
				downloadStats.speed = downloadStats.speed.slice(-GRAPH_TIME * 10);

				if (uploadChart) updateChart(uploadChart, uploadStats.speed);
				if (downloadChart) updateChart(downloadChart, downloadStats.speed);
			});

		fetch('/qbt/sync/maindata?rid=0')
			.then((res) => res.json())
			.then((data) => {
				uploadStats.lifetime = data.server_state.alltime_ul;
				downloadStats.lifetime = data.server_state.alltime_dl;
			});

		fetch('/qbt/torrents/info?filter=seeding')
			.then((res) => res.json())
			.then((data) => {
				uploadStats.count = data.filter(
					(el: torrentInfo) => el.state == 'uploading' || el.upspeed > 0
				).length;
			});
		fetch('/qbt/torrents/info?filter=downloading')
			.then((res) => res.json())
			.then((data) => {
				downloadStats.count = data.length;
			});
	}
</script>

<div class="content">
	<h1>torrents overview</h1>
	<div class="grid">
		<div class="box tall">
			<h4>global stats</h4>
			<span>lifetime upload: {formatBytes(uploadStats.lifetime)}</span>
			<span>lifetime download: {formatBytes(downloadStats.lifetime)}</span>
			<span>
				ratio: {uploadStats.lifetime && downloadStats.lifetime
					? (uploadStats.lifetime / downloadStats.lifetime).toFixed(2)
					: '—'}
			</span>
		</div>
		<div class="box">
			<h4>upload graph</h4>
			<div class="chart-container">
				<canvas bind:this={uploadCanvas}></canvas>
			</div>
		</div>
		<div class="box">
			<h4>download graph</h4>
			<div class="chart-container">
				<canvas bind:this={downloadCanvas}></canvas>
			</div>
		</div>
		<div class="box">
			<h4>upload stats</h4>
			<span>session: {formatBytes(uploadStats.session)}</span>
			<span>limit: {formatBytes(uploadStats.limit)}/s</span>
			<span>
				current: {uploadStats.speed.length ? formatBytes(uploadStats.speed.at(-1)!) + '/s' : '—'}
			</span>
			<span>
				active uploads: {uploadStats.count}
			</span>
		</div>
		<div class="box">
			<h4>download stats</h4>
			<span>session: {formatBytes(downloadStats.session)}</span>
			<span>limit: {formatBytes(downloadStats.limit)}/s</span>
			<span>
				current: {downloadStats.speed.length
					? formatBytes(downloadStats.speed.at(-1)!) + '/s'
					: '—'}
			</span>
			<span>
				active downloads: {downloadStats.count}
			</span>
		</div>
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
		grid-template: repeat(2, 1fr) / repeat(3, 1fr);
		grid-gap: 12px;
	}
	.box {
		padding: 16px;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		outline: 1px solid var(--accent);
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		word-break: break-word;
	}
	.tall {
		grid-row: span 2;
	}
	.chart-container {
		position: relative;
		flex: 1;
		min-height: 150px;
	}
</style>
