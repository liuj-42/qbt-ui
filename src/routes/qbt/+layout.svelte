<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	let { children } = $props();
	let mode = $state('glorp');

	function isActive(current: string) {
		return current == page.url.pathname;
	}

	const navItems = [
		{
			name: 'home',
			href: '/qbt'
		},
		{
			name: 'overview',
			href: '/qbt/overview'
		},
		{
			name: 'table',
			href: '/qbt/table'
		}
	];

	function toggleMode() {
		if (mode == 'glorp') {
			mode = 'normal';
		} else {
			mode = 'glorp';
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="content">
	<nav class="sidebar">
		<button class="glorp" onclick={toggleMode}>
			{mode} mode
		</button>
		<hr />
		{#each navItems as item (item.href)}
			<a href={resolve(item.href)} class:active={isActive(item.href)} class="nav-item">
				<div>{item.name}</div>
			</a>
			<hr />
		{/each}
	</nav>
	<div id="main">
		{@render children()}
	</div>
</div>

<style>
	#content {
		display: flex;
		height: 100%;
		margin: 0 auto;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		background: var(--bg_light);
		border-right: 1px solid var(--border);
		width: 8vw;

		.glorp {
			padding: 0;
			border: 0;
			margin: 8px;
			cursor: pointer;
		}

		.nav-item {
			width: 6vw;
			padding: 6px 1vw;
		}

		.active {
			color: var(--text-3);
		}

		hr {
			border: none;
			border-top: 2px solid var(--border);
			width: 100%;
			margin: 0;
		}

		a {
			width: 100%;
			text-decoration: none;
			color: var(--text);
		}

		a:hover {
			color: var(--accent);
		}
	}

	#main {
		display: flex;
		flex-grow: 1;
		padding: 16px;
	}
</style>
