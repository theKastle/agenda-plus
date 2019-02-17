<template>
  <div
    class="todo-item cursor-pointer"
    :class="{'todo-item--completed': completed, 'todo-item--current-selected': currentSelectedTodoId === id}"
    @click="todoSelected"
  >
    <div class="flex items-start w-full relative">
      <div
        class="todo-checkbox"
        :class="{'todo-checkbox--completed': completed}"
        @click.stop="toggleCompleted"
      />
      <div class="todo-title" :class="{'bg-grey-dark': editing}">
        <div
          class="todo-title__text leading-none"
          :class="{'todo-title__text--completed': completed }"
          v-html="title"
          @dblclick.stop="edit"
          v-if="!editing"
        />
        <input
          maxlength="80"
          ref="titleInput"
          type="text"
          class="todo-item__input"
          v-model="title"
          v-show="editing"
          @blur="saveEdit"
          @keyup.enter="blurTodoInput"
        >
      </div>
      <div class="tag-indicator" :class="{['tag-indicator--' + todo.tagKey]: true}"></div>
      <img
        class="trash absolute pin-r"
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
    },
    currentSelectedTodoId: {
      type: String
    }
  },
  methods: {
    todoSelected: function() {
      this.$emit("todoSelected", this.id);
    },
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