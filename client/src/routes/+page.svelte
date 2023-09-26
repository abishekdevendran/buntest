<script lang="ts">
	import Button from "@/lib/components/ui/button/button.svelte";
	import { todoStore, type TodoType } from "@/lib/stores/todos";
	import { onMount } from "svelte";

  let focussableInput:HTMLInputElement;
  let name ='Abishek';
  let todo:Omit<TodoType,'id'> = {
    title: '',
    completed: false
  }
  onMount(()=>{
    focussableInput.focus();
  })
</script>

<title>Home | Bun Test</title>
<h2>Hello {name}</h2>
<form on:submit={(e)=>{
  e.preventDefault();
  console.log(todo);
  todoStore.add(todo);
  todo = {
    title: '',
    completed: false
  }
  focussableInput.focus();
}}>
  <input type="text" bind:value={todo.title} class="text-black" bind:this={focussableInput} on:focus={()=>console.log('focussed')} />
  <Button type="submit" color="primary">Submit</Button>
</form>
 {#each $todoStore as todo}
  <div class="flex justify-between items-center max-w-3xl bg-gray-600 rounded-lg p-2 m-2">
    <div class="flex items-center">
      <input type="checkbox" bind:checked={todo.completed} />
      <span class="ml-2">{todo.title}</span>
    </div>
    <button on:click={()=>{
      todoStore.remove(todo.id);
      if($todoStore.length === 0){
        focussableInput.focus();
      }
    }} class="text-red-500">Delete</button>
  </div>
{/each}
