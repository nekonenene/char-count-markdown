import Vue from 'vue';
import { markdown } from 'markdown';
import marked from 'marked';

const defaultString = '# Hi!\n\nHello, **World**!\n\n```ruby\na = "abc"\nb = 2\n```\n\nThis is `code`.  \n`printf` is a method.\n\n`printf`はメソッドです。\n\n1. あれ\n2. それ\n3. どれ\n\n* あれ\n* それ\n* どれ\n';

new Vue({
  el: '#app',
  data: {
    inputText: defaultString,
    outputText: '',
    options: {
      withoutCodeblock: false,
      withoutHeading: false,
      withoutTable: false,
      withListItem: true,
    },
  },
  watch: {
    inputText: function (mdText) {
      this.updateOutput(mdText);
    },
    outputText: function (text) {
      this.updateCharCount(text);
    },
    options: {
      deep: true,
      handler: function () {
        this.updateOutput(this.inputText);
      },
    },
  },
  created: function () {
    this.updateOutput(this.inputText);
  },
  methods: {
    updateOutput: function (text) {
      this.outputText = this.getTextFromMarkdown(text);
      this.outputHtml = marked(text);
      this.updateCharCount(this.outputText);
    },
    updateCharCount: function (text) {
      const newLines = (text.match(/\n/g) || []).length;
      this.lineCount = newLines + 1;
      this.charCount = text.length - newLines;
      this.charCountWithoutSpace = (text.match(/\S/g) || []).length;
    },
    getTextFromMarkdown(mdStr) {
      let str = '';
      let listDepth = -1;
      const listStyles = [];

      const tokens = marked.lexer(mdStr);
      console.log(tokens);

      tokens.forEach((token) => {
        switch (token.type) {
          case 'space':
            str += '\n';
            break;
          case 'hr':
            // str += '---\n\n';
            str += '\n';
            break;
          case 'code':
            if (this.options.withoutCodeblock) break;
            str += token.text;
            str += '\n\n';
            break;
          case 'table':
            if (this.options.withoutTable) break;
            str += this.getTextFromTableToken(token);
            break;
          case 'list_start':
            listDepth += 1;
            listStyles[listDepth] = {};
            listStyles[listDepth].ordered = token.ordered;
            if (token.ordered) listStyles[listDepth].num = token.start;
            break;
          case 'list_item_start':
            str += '\t'.repeat(listDepth);

            if (!this.options.withListItem) break;
            if (listStyles[listDepth].ordered) {
              str += `${listStyles[listDepth].num}. `;
              listStyles[listDepth].num += 1;
            } else {
              str += '・';
            }
            break;
          case 'list_end':
            listDepth -= 1;
            break;
          default:
            if (token.type === 'heading' && this.options.withoutHeading) break;
            if (token.text != null) {
              const parsed = markdown.parse(token.text);
              str += this.getTextByParsedArray(parsed);
              str += '\n';
              if (token.type === 'heading') str += '\n';
            }
            break;
        }
      });

      return str;
    },
    getTextFromTableToken: function (token) {
      console.log(token);
      let str = '';

      token.header.forEach((column, idx) => {
        const parsed = markdown.parse(column);
        str += this.getTextByParsedArray(parsed);
        if (idx !== token.header.length - 1) {
          str += '\t';
        }
      });
      str += '\n';

      token.cells.forEach((cell) => {
        cell.forEach((column, idx) => {
          const parsed = markdown.parse(column);
          str += this.getTextByParsedArray(parsed);
          if (idx !== cell.length - 1) {
            str += '\t';
          }
        });
        str += '\n';
      });
      str += '\n';

      return str;
    },
    getTextByParsedArray: function (parsed) {
      let str = '';
      parsed.shift();

      parsed.forEach((item) => {
        str += this.normalizeParagraph(item);
      });

      return str;
    },
    normalizeParagraph(arr) {
      let str = '';
      const type = arr[0];
      arr.shift();

      if (type === 'header') {
        arr.shift();
      }

      arr.forEach((item) => {
        if (Array.isArray(item)) {
          if (item[0] === 'linebreak') {
            str += '\n';
            return;
          }
          if (item[0] === 'inlinecode') {
            str += item[1];
            return;
          }

          str += this.normalizeParagraph(item);
          return;
        }

        if (typeof item === 'string') {
          str += item.replace(/<(?:.|\n)+?>/gm, '');
        }

        // console.log(item);
        // console.log(typeof item);
      });

      return str;
    },
  },
});
