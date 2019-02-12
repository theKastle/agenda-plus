<template>
  <div>
    <div class="todo-title">
      <div
        class="todo-title__text leading-none"
        :class="{'todo-title__text--completed': completed, 'font-bold': isFocused}"
        v-html="markedTitle"
      />
    </div>
    <codemirror
      ref="myCm"
      class="w-full"
      v-if="editDetail && todo.viewDetail"
      v-model="detail"
      :options="cmOptions"
      @inputRead="triggerHint"
    ></codemirror>
    <div
      v-html="compiledDetail"
      @click.stop="openEdit"
      v-if="!editDetail && detail.length && todo.viewDetail"
      class="text-white px-20 py-4 overflow-hidden leading-normal bg-black w-full"
    ></div>
  </div>
</template>


<style>
@import "~highlight.js/styles/atom-one-dark.css";
@import "~codemirror/lib/codemirror.css";
@import "~codemirror/theme/material.css";
@import "~codemirror/addon/hint/show-hint.css";
</style>

<script>
/* eslint-disable */
import hljs from "highlight.js";
import markdownIt from "markdown-it";
import marked from "marked";
import { codemirror } from "vue-codemirror";
import CodeMirror from "codemirror";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/anyword-hint.js";

CodeMirror.hint.javascript = function(editor, options) {
  const keywords = [
    "console",
    "log",
    "var",
    "let",
    "const",
    "split",
    "map",
    "filter",
    "reduce",
    "foreach",
    "function"
  ];

  var cursor = editor.getCursor();
  var currentLine = editor.getLine(cursor.line);
  var start = cursor.ch;
  var end = start;
  while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end)))
    ++end;
  while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) --start;
  var curWord = start != end && currentLine.slice(start, end);
  var regex = new RegExp("^" + curWord, "i");
  const result = {
    list: (!curWord
      ? []
      : keywords.filter(function(item) {
          return item.match(regex);
        })
    )
      .sort()
      .concat(CodeMirror.hint.anyword(editor, options).list)
      .slice(0, 7),
    from: CodeMirror.Pos(cursor.line, start),
    to: CodeMirror.Pos(cursor.line, end)
  };

  return result;
};

const md = markdownIt({
  langPrefix: "language-",
  html: true,
  linkify: true,
  typographer: true,
  quotes: "“”‘’",
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {
        return str;
      }
    }

    return "";
  }
});

export default {
  name: "TodoItem",
  props: {
    todo: {
      type: Object,
      required: true
    },
    focusedItemIndex: {
      type: Number,
      required: true
    }
  },
  components: {
    codemirror
  },
  computed: {
    markedTitle: function() {
      return md.render(this.title);
    },
    compiledDetail: function() {
      marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function(code) {
          return hljs.highlightAuto(code).value;
        }
      });
      return marked(this.detail);
    },
    detailLinesCount: function() {
      return this.detail.split("\n").length;
    },
    codemirror() {
      return this.$refs.myCm.codemirror;
    },
    computedTabIndex() {
      return this.id === "0" ? "0" : "-1";
    },
    isFocused() {
      return this.id === this.focusedItemIndex;
    }
  },
  mounted: function() {
    if (this.id === this.focusedItemIndex) {
      this.$el.focus();
    }
  },
  methods: {
    toggleCompleted: function() {
      this.completed = !this.completed;
      this.$emit("statusChanged", this.id, this.completed);
    },
    openEdit: function() {
      this.editDetail = true;
    },
    addNewLine: function() {
      this.$refs.detailEditor.rows = this.detail.split("\n").length + 1;
    },
    onEditBlur: function() {
      this.saveDetail();
      this.editDetail = false;
    },
    saveDetail: function() {
      this.$emit("detailEditDone", this.id, this.detail);
    },
    blurCodeMirror: function() {
      this.onEditBlur();
      this.$refs.todoItem.focus();
    },
    todoKeyup: function(e) {
      if (this.editDetail) {
        return;
      }

      if (e.code === "ArrowUp") {
        this.$emit("todoKeyup", this.id - 1);
      } else if (e.code === "ArrowDown") {
        this.$emit("todoKeyup", this.id + 1);
      }
    },
    triggerHint: function(editor, input) {
      if (input.origin === "paste" || !input.text[0].match(/^[a-z0-9]+$/i)) {
        return;
      }

      editor.showHint({
        hint: CodeMirror.hint.javascript,
        alignWithWord: true
      });
    },
    onNativeTodoClick: function() {
      if (!this.editDetail) {
        this.$emit("todoItemClicked");
      } else {
        this.blurCodeMirror();
      }
    }
  },
  data: function() {
    return {
      id: this.todo.id,
      title: this.todo.title,
      detail: this.todo.detail || "",
      completed: this.todo.completed,
      editDetail: false,
      cmOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: "text/markdown",
        lineWrapping: true,
        theme: "material",
        hintOptions: {
          completeSingle: false
        },
        extraKeys: {
          Esc: this.blurCodeMirror
        },
        preview: true,
        autofocus: true,
        viewportMargin: Infinity
      }
    };
  }
};
</script>