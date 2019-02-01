<template>
  <div class="todo-item" :class="{'todo-item--completed': completed}">
    <div
      class="todo-checkbox"
      :class="{'todo-checkbox--completed': completed}"
      @click="toggleCompleted"
    />
    <div class="todo-title">
      <div class="todo-title__text" :class="{'todo-title__text--completed': completed}">{{ title }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TodoItem",
  props: {
    todo: {
      type: Object,
      required: true
    }
  },
  computed: {},
  methods: {
    toggleCompleted: function() {
      this.completed = !this.completed;
      this.$emit('statusChanged', this.id, this.completed)
    }
  },
  data: function() {
    return {
      id: this.todo.id,
      title: this.todo.title,
      completed: this.todo.completed,
    };
  }
};
</script>