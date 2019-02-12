<template>
  <div class="todo-item cursor-pointer" :class="{'todo-item--completed': completed}">
    <div class="flex items-center w-full">
      <div
        class="todo-checkbox"
        :class="{'todo-checkbox--completed': completed}"
        @click.stop="toggleCompleted"
      />
      <div class="todo-title" :class="{'bg-grey-darkest': editing}">
        <div
          class="todo-title__text leading-none"
          :class="{'todo-title__text--completed': completed }"
          v-html="title"
          @click="edit"
          v-if="!editing"
        />
        <input
          ref="titleInput"
          type="text"
          class="bg-grey-darkest w-full text-white outline-none leading-none"
          v-model="title"
          v-show="editing"
          @blur="saveEdit"
          @keyup.enter="blurTodoInput"
        >
      </div>
      <img
        class="trash"
        src="../assets/trash.svg"
        width="20"
        @click.stop="trashClicked"
        v-show="!editing"
      >
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
  methods: {
    toggleCompleted: function() {
      this.completed = !this.completed;
      this.$emit("statusChanged", this.id, this.completed);
    },
    trashClicked: function() {
      this.$emit("trashClicked", this.todo);
    },
    edit: function() {
      this.editing = true;
      this.$nextTick(() => this.$refs.titleInput.focus());
    },
    saveEdit: function() {
      this.editing = false;
      this.$emit("todoTitleEdited", this.id, this.title);
    },
    blurTodoInput: function() {
      this.$refs.titleInput.blur();
    }
  },
  data: function() {
    return {
      id: this.todo.id,
      title: this.todo.title,
      editing: false,
      completed: this.todo.completed
    };
  }
};
</script>