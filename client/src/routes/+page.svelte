<script lang="ts">
	import Button from "@/lib/components/ui/button/button.svelte";

  let name ='Abishek';
</script>
<h2>Hello {name}</h2>
<Button on:click={()=>name+='k'}>Stronger</Button>
