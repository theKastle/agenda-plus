import uid from "uid";

const getTodosOfGroup = (db, groupId) =>
  db.todoIdsInGroup[groupId].map(id => db.todoById[id]);

const getGroups = db => db.groupIds.map(id => db.groupById[id]);

const getTodo = (db, todoId) => {
  return db.todoById[todoId];
};

const todosInGroupAppended = (todoIdsInGroup, groupId, todoId) => ({
  ...todoIdsInGroup,
  [groupId]: [todoId, ...(todoIdsInGroup[groupId] || [])]
});

const groupAdded = db => {
  const latestGroupId = uid();
  const groupById = entityPatched(db.groupById, latestGroupId, {
    id: latestGroupId
  });

  return {
    ...db,
    groupById,
    groupIds: [...db.groupIds, latestGroupId],
    todoIdsInGroup: {
      ...db.todoIdsInGroup,
      [latestGroupId]: []
    }
  };
};

const groupRemoved = (db, groupId) => {
  db.groupIds = entityIdsRemoved(db.groupIds, groupId);
  return db;
};

const todoRemoved = (db, groupId, todoId) => {
  db.todoIdsInGroup[groupId] = entityIdsRemoved(
    db.todoIdsInGroup[groupId],
    todoId
  );
  return db;
};

const entityPatched = (dataObject, entityId, patchedData) => ({
  ...dataObject,
  [entityId]: {
    ...dataObject[entityId],
    ...patchedData,
    id: entityId
  }
});

const entityIdsRemoved = (idArrays = [], entityId) =>
  idArrays.filter(id => id !== entityId);

const todoPositionUpdated = (db, groupId, sourceIndex, destIndex) => {
  const todoIdsInGroup = db.todoIdsInGroup;
  const sourceId = todoIdsInGroup[groupId][sourceIndex];
  const removedSourceGroup = todoIdsInGroup[groupId].filter(
    id => id !== sourceId
  );
  removedSourceGroup.splice(destIndex, 0, sourceId);

  db.todoIdsInGroup = {
    ...todoIdsInGroup,
    [groupId]: removedSourceGroup
  };

  return db;
};

const todoAdded = (db, groupId, todo) => {
  const latestTodoId = uid();
  const newTodoGroup = todosInGroupAppended(
    db.todoIdsInGroup,
    groupId,
    latestTodoId
  );
  const newTodoDetail = entityPatched(db.todoById, latestTodoId, {
    id: latestTodoId,
    groupId,
    ...todo
  });

  return {
    ...db,
    todoIdsInGroup: newTodoGroup,
    todoById: newTodoDetail
  };
};

const todoPatched = (db, todoId, todo) => {
  db.todoById = entityPatched(db.todoById, todoId, todo);
  return db;
};

const groupPatched = (db, groupId, group) => {
  db.groupById = entityPatched(db.groupById, groupId, group);
  return db;
};

// RETURN SCOPE:
//
//          todo      __todoDetail      todoIdsInGroup   todoMarkdownNote
// add      db        todoById        db          todo
// remove   db        x                 db          x
// patch    __todo                      todoIdsInGroup   todo
//          -detail

// INTERNAL:                    EXTERNAL:
//                              - list of todos of a group
// - todoIds                    - todo:
//                                + id
//                                + detail
//                                + markdown
// - groupIds                   - list of groups with name
// - groupById                - a group
//                                + name
// - groupIds

// APIs:
// - todoAdded:               (db, groupId, todo) => db                     --> add todo to a group (todo title known beforehand)
// - todoPatched:             (db, todoId, patchedTodoData) => db       --> patch a todo with data (title, markdown, status)
// - todoPositionUpdated:     (db, groupId, sourceIndex, destIndex) => db  --> move a todo to new position in one group
// - todoRemoved:             (db, groupId, todoId) => db        --> remove a todo from a group
// - groupRemoved:            (db) => db                                    --> remove a group
// - groupAdded:              (db) => db                                    --> add a group (group name not known beforehand, init with default name)
// - groupPatched:            (db, groupId, patchedGroup) => db         --> patch a group with data (name)
// - getTodo:                 (db, todoId) => todo
// - getGroups:               (db) => groups (name and id only)
// - getTodosOfGroup:         (db, groupId) => todos[]

export default {
  todoAdded,
  todoPatched,
  todoPositionUpdated,
  todoRemoved,
  groupRemoved,
  groupAdded,
  groupPatched,
  getTodo,
  getGroups,
  getTodosOfGroup
};
