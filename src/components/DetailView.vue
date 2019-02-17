<template>
  <div class="flex flex-grow items-stretch relative">
    <div class="absolute tags-list">
      <div
        v-for="tag in sortedTags"
        :key="tag.key"
        :class="`tag tag--${tag.key}`"
        @click="tagSelected(tag)"
      ></div>
    </div>
    <codemirror
      ref="myCm"
      class="w-full flex-grow"
      v-model="editableMarkdown"
      :options="cmOptions"
      @inputRead="triggerHint"
      @blur="onEditBlur"
      v-if="editDetail"
    ></codemirror>
    <div
      v-html="compiledDetail"
      @dblclick.stop="openEdit"
      v-if="!editDetail"
      class="px-20 py-4 overflow-auto leading-normal avenir-white-theme bg-white w-full"
    ></div>
  </div>
</template>


<style>
@import "~highlight.js/styles/atom-one-dark.css";
@import "~codemirror/lib/codemirror.css";
@import "~codemirror/theme/neat.css";
@import "~codemirror/addon/hint/show-hint.css";
</style>

<script>
/* eslint-disable */
import hljs from "highlight.js";
import marked from "marked";
import { codemirror } from "vue-codemirror";
import CodeMirror from "codemirror";
import "codemirror/mode/gfm/gfm.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/python/python.js";
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

export default {
  name: "TodoMarkdownNote",
  props: {
    todoId: {
      type: String,
      required: true
    },
    tagKey: {
      type: String
    },
    todoMarkdown: {
      type: String,
      default: ""
    }
  },
  components: {
    codemirror
  },
  computed: {
    compiledDetail: function() {
      return marked(this.editableMarkdown);
    },
    detailLinesCount: function() {
      return this.editableMarkdown.split("\n").length;
    },
    codemirror() {
      return this.$refs.myCm.codemirror;
    },
    sortedTags() {
      if (!this.tagKey) {
        return this.tags;
      }

      return [
        { key: this.tagKey },
        ...this.tags.filter(tag => tag.key !== this.tagKey)
      ];
    }
  },
  watch: {
    todoMarkdown: function() {
      this.editableMarkdown = this.todoMarkdown;
    }
  },
  methods: {
    openEdit: function() {
      this.editDetail = true;
    },
    addNewLine: function() {
      this.$refs.detailEditor.rows =
        this.editableMarkdown.split("\n").length + 1;
    },
    onEditBlur: function() {
      this.$emit("detailEditDone", this.todoId, this.editableMarkdown);
      this.editDetail = false;
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
    tagSelected: function(tag) {
      this.$emit("tagSelected", this.todoId, tag);
    }
  },
  data: function() {
    return {
      editDetail: false,
      tags: [
        {
          key: "yellow"
        },
        {
          key: "green"
        },
        {
          key: "blue"
        },
        {
          key: "grey"
        },
        {
          key: "red"
        }
      ],
      cmOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        theme: "default",
        hintOptions: {
          completeSingle: false
        },
        autofocus: true,
        viewportMargin: Infinity,
        theme: "neat",
        mode: {
          name: "text/x-gfm",
          taskLists: true,
          strikethrough: true,
          highlightFormatting: true,
          gitHubSpice: true,
          emoji: true,
          fencedCodeBlockHighlighting: true
        }
      },
      editableMarkdown: this.todoMarkdown
    };
  }
};
</script>