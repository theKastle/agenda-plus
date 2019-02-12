<template>
  <div
    class="text-white px-3 py-2 border-r border-grey-darkest tab flex items-center cursor-pointer flex-no-grow"
    :class="{'tab--active': active}"
  >
    <div class="tab__text leading-none whitespace-no-wrap flex-no-grow">
      <span v-show="!editing" @dblclick="edit" @click="chooseGroup">{{name}}</span>
      <input
        ref="nameInput"
        type="text"
        class="bg-black text-white outline-none leading-none max-w-full"
        v-model.trim="name"
        v-show="editing"
        @blur="saveEdit"
        @keyup.enter="blurNameInput"
      >
    </div>

    <div
      class="tab__close-icon text-grey-dark ml-3 leading-none cursor-pointer"
      @click.stop="closeGroup(id)"
    >x</div>
  </div>
</template>

<script>
export default {
  name: "GroupTab",
  props: {
    group: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean
    }
  },
  methods: {
    chooseGroup: function() {
      this.$emit("chooseGroup", this.id);
    },
    edit: function() {
      this.editing = true;
      this.$nextTick(() => this.$refs.nameInput.focus());
    },
    saveEdit: function() {
      this.editing = false;
      if (!this.name) {
        this.name = this.group.name;
        return;
      }
      this.$emit("groupNameEdited", this.id, this.name);
    },
    blurNameInput: function() {
      this.$refs.nameInput.blur();
    },
    closeGroup: function(index) {
      this.$emit("closeGroup", index);
    }
  },
  data: function() {
    return {
      id: this.group.id,
      name: this.group.name || `Group ${this.group.id}`,
      editing: false
    };
  }
};
</script>