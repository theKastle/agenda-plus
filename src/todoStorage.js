import reducer from "./dataReducer.js";

const STORAGE_KEY = "todos-electron-vue";

const initialDb = {
  latestGroupId: 1,
  latestTodoId: 0,
  todoIdsInGroup: {},
  todoById: {},
  groupIds: [1],
  groupById: { "1": { name: "default", id: "1" } }
};

export const todoStorage = {
  appState: {},
  load: function() {
    this.appState.db = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialDb;
  },
  save: function() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.appState.db));
  },
  addTodo: function(groupId, todo) {
    this.appState.db = reducer.todoAdded(this.appState.db, groupId, todo);
  },
  patchTodo: function(todoId, todo) {
    this.appState.db = reducer.todoPatched(this.appState.db, todoId, todo);
  },
  updateTodoPosition: function(groupId, sourceIndex, destIndex) {
    this.appState.db = reducer.todoPositionUpdated(
      this.appState.db,
      groupId,
      sourceIndex,
      destIndex
    );
  },
  removeTodo: function(groupId, todoId) {
    this.appState.db = reducer.todoRemoved(this.appState.db, groupId, todoId);
    console.log(this.appState.db.todoIdsInGroup);

  },
  removeGroup: function(groupId) {
    this.appState.db = reducer.groupRemoved(this.appState.db, groupId);
  },
  addGroup: function() {
    this.appState.db = reducer.groupAdded(this.appState.db);
  },
  patchGroup: function(groupId, group) {
    this.appState.db = reducer.groupPatched(this.appState.db, groupId, group);
  },
  getTodo: function(todoId) {
    return reducer.getTodo(this.appState.db, todoId);
  },
  getGroups: function() {
    return reducer.getGroups(this.appState.db);
  },
  getTodosOfGroup: function(groupId) {
    return reducer.getTodosOfGroup(this.appState.db, groupId);
  }
};
