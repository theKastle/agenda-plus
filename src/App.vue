<template>
  <div id="app" class="w-full h-full font-sans flex overflow-auto max-w-full flex-col">
    <div
      class="w-full bg-black flex flex-initial flex-row justify-between items-stretch h-8 border-b border-blue-dark"
      style="-webkit-app-region: drag"
    >
      <div class="flex justify-start no-drag">
        <transition-group
          enter-active-class="tab-expand"
          tag="div"
          class="flex justify-start"
          @after-enter="groupAfterEnter"
        >
          <GroupTab
            v-for="group in groups"
            :key="group.id"
            :active="group.id == selectedGroupId"
            @closeGroup="closeGroup"
            @chooseGroup="chooseGroup"
            @groupNameEdited="groupNameEdited"
            :group="group"
          />
        </transition-group>
        <transition name="tab-plus" @after-leave="tabPlusAfterLeave">
          <div
            class="m-1 w-5 text-center text text-grey-light text-xl tab-plus cursor-pointer"
            @click="addGroup"
            v-if="showTabPlus"
          >+</div>
        </transition>
      </div>
      <div class="flex flex-initial justify-end items-center pr-2 no-drag">
        <div class="rounded-full bg-red-dark w-4 h-4 cursor-pointer no-drag" @click="quitApp"></div>
      </div>
    </div>
    <div class="border-r border-grey-darker w-1/3 overflow-auto relative flex-no-shrink flex-grow">
      <div class="sticky pin-t w-full p-2 pb-1 bg-black flex z-50">
        <div class="input-text">
          <input
            maxlength="80"
            @keyup.enter="addTodo"
            v-model.trim="newTodo"
            placeholder="Add new todo"
            class="input-text__input"
          >
        </div>
      </div>
      <TodoList
        :todos="todos"
        :key="selectedGroupId"
        @statusChanged="statusChanged"
        @trashClicked="trashClicked"
        @dropEnd="onDropEnd"
        @titleChanged="titleChanged"
      />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import TodoList from "./components/TodoList";
import GroupTab from "./components/GroupTab";
import { todoDb, todoStorage } from "./todoStorage";

export default {
  name: "app",
  data: function() {
    todoStorage.load();

    return {
      selectedGroupId: 1,
      showTabPlus: true,
      newTodo: "",
      appState: todoStorage.appState
    };
  },
  computed: {
    todos: function() {
      return todoStorage.getTodosOfGroup(this.selectedGroupId);
    },
    groups: function() {
      return todoStorage.getGroups();
    }
  },
  watch: {
    appState: {
      handler: function() {
        todoStorage.save();
      },
      deep: true
    }
  },
  methods: {
    groupNameEdited: function(groupId, groupName) {
      todoStorage.patchGroup(groupId, {
        name: groupName
      });
    },
    chooseGroup: function(groupId) {
      this.selectedGroupId = groupId;
    },
    closeGroup: function(id) {
      this.selectedGroupId = 1;
      todoStorage.removeGroup(id);
    },
    groupAfterEnter: function() {
      this.showTabPlus = true;
    },
    addGroup: function() {
      this.showTabPlus = false;
    },
    tabPlusAfterLeave: function() {
      todoStorage.addGroup();
    },
    addTodo: function() {
      if (this.newTodo) {
        todoStorage.addTodo(this.selectedGroupId, {
          title: this.newTodo,
          completed: false,
          detail: ""
        });
        this.newTodo = "";
      }
    },
    onDropEnd: function(dropResult) {
      const { removedIndex, addedIndex, groupKey } = dropResult;
      todoStorage.updateTodoPosition(groupKey, removedIndex, addedIndex);
    },
    statusChanged: function(id, status) {
      const completedTodo = {
        ...todoStorage.getTodo(id),
        completed: status
      };
      todoStorage.patchTodo(id, completedTodo);
    },
    trashClicked: function(todo) {
      todoStorage.removeTodo(todo.groupId, todo.id);
    },
    titleChanged: function(id, title) {
      const editedTodo = {
        ...todoStorage.getTodo(id),
        title
      };
      todoStorage.patchTodo(id, editedTodo);
    },
    quitApp: function() {
      ipcRenderer.send("quit-app");
    }
  },
  components: {
    TodoList,
    GroupTab
  }
};
</script>

<style src="./assets/main.scss" lang="scss">
