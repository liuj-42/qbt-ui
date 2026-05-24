<!--
TODO:
global options:
- [x] add toggle between bytes/bits
- [x] add types / constants to separate file
- [ ] look into how to use global state for things like torrent data, etc.
global stats:
- [ ] add network connection status: firewalled/connected/disconnected
- [ ] visual for space used / available w/ labels:
    pie chart? bar chart? some other plot? check chart.js available options
- [x] fix rid for /sync/maindata endpoint
graphs:
- [x] add default numbers for y axis
- [ ] label x axis
- [ ] add controls for graph
    - [ ] max time
    - [ ] graph style (btop graph settings)
component stuff:
- [ ] move graphs into their own components + figure out what to do with the create/update chart functions
- [ ] move the other things too, see if theres a slot or something to pass data through
styling:
- [ ] make it better
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { format } from '$lib/utils/units';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Filler
	} from 'chart.js';
	import type { TransferStats, torrentInfo } from '$lib/types';
	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);

	let GRAPH_TIME = 15;
	let SPEED_UNITS: 'bits' | 'bytes' = $state('bits');
	let STORAGE_UNITS: 'bytes' | 'binary' = $state('bytes');
	let rid = $state(0);

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
						min: 0,
						suggestedMax: 1_000_000,
						ticks: { callback: (v) => format(SPEED_UNITS, v as number) + 'ps' }
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

		fetch(`/qbt/sync/maindata?rid=${rid}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.server_state) {
					if (data.server_state.alltime_ul) uploadStats.lifetime = data.server_state.alltime_ul;
					if (data.server_state.alltime_dl) downloadStats.lifetime = data.server_state.alltime_dl;
				}
				if (data.rid) rid = data.rid;
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

	function toggleSpeedUnits() {
		SPEED_UNITS = SPEED_UNITS == 'bytes' ? 'bits' : 'bytes';
		if (uploadChart) updateChart(uploadChart, uploadStats.speed);
		if (downloadChart) updateChart(downloadChart, downloadStats.speed);
	}

	function toggleDataUnits() {
		STORAGE_UNITS = STORAGE_UNITS == 'bytes' ? 'binary' : 'bytes';
	}
</script>

<div class="content">
	<header>
		<h1>torrents overview</h1>
		<span></span>
		<span class="units">
			<label for="speed_units_toggle">
				<input id="speed_units_toggle" type="checkbox" oninput={toggleSpeedUnits} />
				speed units bytes to bits (kB/s -> kbps)
			</label>
			<label for="data_units_toggle">
				<input id="data_units_toggle" type="checkbox" oninput={toggleDataUnits} />
				data units bytes to binary units (kB -> KiB)
			</label>
		</span>
	</header>
	<div class="grid">
		<div class="box tall">
			<h4>global stats</h4>
			<span>lifetime upload: {format(STORAGE_UNITS, uploadStats.lifetime)}</span>
			<span>lifetime download: {format(STORAGE_UNITS, downloadStats.lifetime)}</span>
			<span>
				ratio: {uploadStats.lifetime && downloadStats.lifetime
					? (uploadStats.lifetime / downloadStats.lifetime).toFixed(2)
					: '—'}
			</span>
			<span>
				<button onclick={getData}>refresh data</button>
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
			<span>session: {format(STORAGE_UNITS, uploadStats.session)}</span>
			<span>limit: {format(SPEED_UNITS, uploadStats.limit)}ps</span>
			<span>
				current: {uploadStats.speed.length
					? format(SPEED_UNITS, uploadStats.speed.at(-1)!) + 'ps'
					: '—'}
			</span>
			<span>
				active uploads: {uploadStats.count}
			</span>
		</div>
		<div class="box">
			<h4>download stats</h4>
			<span>session: {format(STORAGE_UNITS, downloadStats.session)}</span>
			<span>limit: {format(SPEED_UNITS, downloadStats.limit)}ps</span>
			<span>
				current: {downloadStats.speed.length
					? format(SPEED_UNITS, downloadStats.speed.at(-1)!) + 'ps'
					: '—'}
			</span>
			<span>
				active downloads: {downloadStats.count}
			</span>
		</div>
	</div>
</div>

<style>
	header {
		display: flex;

		h1 {
			flex-grow: 1;
		}
		.units {
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
			align-items: flex-start;
		}
	}
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
