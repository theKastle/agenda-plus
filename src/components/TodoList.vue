<template>
  <div class="flex w-full flex-wrap justify-start px-2 pb-10">
    <TodoItem v-for="(todo, index) in todos" :key="index" :todo="todo" @statusChanged="statusChanged"/>
  </div>
</template>

<script>
import TodoItem from "./TodoItem";

export default {
  name: "TodoList",
  props: ["todos"],
  methods: {
    statusChanged: function(id, status) {
      this.$emit("statusChanged", id, status);
    }
  },
  components: {
    TodoItem
  }
};
</script>