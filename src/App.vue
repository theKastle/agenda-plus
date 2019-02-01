<template>
  <div id="app" class="w-full h-full font-sans">
    <TodoList :todos="todos" @statusChanged="statusChanged"/>
    <div class="fixed pin-b w-full p-1 bg-black flex">
      <div class="input-text">
        <input
          type="text"
          class="input-text__input"
          @keypress.enter="addTodo"
          v-model.trim="newTodo"
          placeholder="Add new todo"
        >
      </div>
    </div>
  </div>
</template>

<script>
import TodoList from "./components/TodoList";

var STORAGE_KEY = "todos-electron-vue";
var todoStorage = {
  fetch: function() {
    var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    todos.forEach(function(todo, index) {
      todo.id = index;
    });
    return todos;
  },
  save: function(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
};

export default {
  name: "app",
  data: function() {
    return {
      newTodo: "",
      todos: todoStorage.fetch()
    };
  },
  watch: {
    todos: {
      handler: function(todos) {
        todoStorage.save(todos);
      },
      deep: true
    }
  },
  methods: {
    addTodo: function() {
      if (this.newTodo) {
        this.todos.push({
          id: this.todos.length,
          title: this.newTodo,
          completed: false
        });
        this.newTodo = "";
      }
    },
    statusChanged: function(id, status) {
      const completedTodo = {
        ...this.todos.find(todo => todo.id === id),
        completed: status
      };
      this.todos.splice(completedTodo.id, 1, completedTodo);
    }
  },
  components: {
    TodoList
  }
};
</script>

<style src="./assets/main.scss" lang="scss">
