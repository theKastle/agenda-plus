<template>
  <div
    id="app"
    class="w-full h-full font-sans flex overflow-auto max-w-full flex-col"
    :class="{'pointer-resize': mouseDown}"
  >
    <div
      class="w-full bg-black flex flex-no-shrink flex-row justify-between items-stretch h-8 tab-bar"
      style="-webkit-app-region: drag"
    >
      <div class="flex justify-start no-drag">
        <transition-group
          enter-active-class="tab-expand"
          tag="div"
          class="flex justify-start overflow-x-auto overflow-y-hidden max-w-80-vw tab-group"
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
        <div
          class="rounded-full bg-yellow-dark w-4 h-4 cursor-pointer no-drag mr-2"
          @click="minimizeApp"
        ></div>
        <div
          class="rounded-full bg-green-dark w-4 h-4 cursor-pointer no-drag mr-2"
          @click="maximizeApp"
        ></div>
        <div class="rounded-full bg-red-dark w-4 h-4 cursor-pointer no-drag" @click="quitApp"></div>
      </div>
    </div>
    <div class="w-100 flex flex-grow items-stretch" @mouseup="onMouseUp" @mousemove="onMouseMove">
      <div
        class="w-1/3 lg:w-1/4 overflow-auto relative flex-no-shrink"
        :style="{width: todoListWidth + 'px'}"
      >
        <div class="sticky pin-t w-full p-2 bg-black flex z-50">
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
          :currentSelectedTodoId="currentSelectedTodoId"
          @statusChanged="statusChanged"
          @trashClicked="trashClicked"
          @dropEnd="onDropEnd"
          @titleChanged="titleChanged"
          @todoSelected="todoSelected"
        />
      </div>
      <div class="bg-blue-dark resize-border" @mousedown.stop.prevent="onMouseDown"></div>
      <DetailView
        :todoId="currentSelectedTodoId"
        :todoMarkdown="currentSelectedTodo.detail"
        :tagKey="currentSelectedTodo.tagKey"
        @detailEditDone="saveTodo"
        @tagSelected="tagSelected"
      />
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import TodoList from "./components/TodoList";
import GroupTab from "./components/GroupTab";
import DetailView from "./components/DetailView";
import { todoStorage } from "./todoStorage";

export default {
  name: "app",
  data: function() {
    todoStorage.load();
    todoStorage.save();

    return {
      todoListWidth: window.innerWidth / 3,
      mouseDown: false,
      selectedGroupId: "1",
      showTabPlus: true,
      newTodo: "",
      appState: todoStorage.appState,
      currentSelectedTodoId: "1"
    };
  },
  computed: {
    todos: function() {
      return todoStorage.getTodosOfGroup(this.selectedGroupId);
    },
    groups: function() {
      return todoStorage.getGroups();
    },
    currentSelectedTodo: function() {
      return todoStorage.getTodo(this.currentSelectedTodoId) || {};
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
    tagSelected: function(todoId, tag) {
      todoStorage.patchTodo(todoId, {
        tagKey: tag.key
      });
    },
    onMouseMove: function(e) {
      const mouseHorizontalPosition = e.x;
      if (
        this.mouseDown &&
        mouseHorizontalPosition > 300 &&
        mouseHorizontalPosition < 500
      ) {
        this.todoListWidth = mouseHorizontalPosition;
      }
    },
    onMouseDown: function() {
      this.mouseDown = true;
    },
    onMouseUp: function() {
      this.mouseDown = false;
    },
    todoSelected: function(id) {
      this.currentSelectedTodoId = id;
    },
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
    saveTodo: function(id, markdown) {
      todoStorage.patchTodo(id, {
        detail: markdown
      });
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
    },
    minimizeApp: function() {
      ipcRenderer.send("minimize-app");
    },
    maximizeApp: function() {
      ipcRenderer.send("maximize-app");
    }
  },
  components: {
    TodoList,
    GroupTab,
    DetailView
  }
};
</script>

<style src="./assets/main.scss" lang="scss">
