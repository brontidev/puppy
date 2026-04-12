<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from './Button.svelte';
</script>

<Button title="dom" desc="control your partner" href={resolve('/login_page/dom')} arrow></Button>
<Button title="sub" desc="controlled by your partner" href={resolve('/login_page/sub')} arrow></Button>