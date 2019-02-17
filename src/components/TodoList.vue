<template>
  <div class="flex w-full flex-wrap justify-start pb-10">
    <Container v-model="todos" @drop="onDrop" class="w-full flex-wrap">
      <Draggable v-for="todo in todos" :key="`${todo.id}`" class="w-full">
        <TodoItem
          :todo="todo"
          :currentSelectedTodoId="currentSelectedTodoId"
          @statusChanged="statusChanged"
          @trashClicked="trashClicked"
          @todoTitleEdited="saveTodo"
          @todoSelected="todoSelected"
        />
      </Draggable>
    </Container>
  </div>
</template>

<script>
import TodoItem from "./TodoItem";
import { Container, Draggable } from "vue-smooth-dnd";

export default {
  name: "TodoList",
  props: ["todos", "currentSelectedTodoId"],
  methods: {
    todoSelected: function(id) {
      this.$emit("todoSelected", id);
    },
    statusChanged: function(id, status) {
      this.$emit("statusChanged", id, status);
    },
    trashClicked: function(todo) {
      this.$emit("trashClicked", todo);
    },
    onDrop: function(dropResult) {
      const { removedIndex = -1, addedIndex = -1 } = dropResult;
      if (removedIndex >= 0 && addedIndex >= 0) {
        this.$emit("dropEnd", { ...dropResult, groupKey: this.$vnode.key });
      }
    },
    saveTodo: function(id, title) {
      this.$emit("titleChanged", id, title);
    }
  },
  components: {
    TodoItem,
    Container,
    Draggable
  }
};
</script>