<script lang="ts">
	let { title = 'yeah', data = {}, display = 'text' } = $props();
</script>

<div class="box">
	<h3>{title}</h3>
</div>

<style>
	.box {
		padding: 16px;
		border-radius: 12px;

		outline: 1px solid var(--accent);
	}
</style>
