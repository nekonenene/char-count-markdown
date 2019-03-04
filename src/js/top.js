import Vue from 'vue';
import { markdown } from 'markdown';
import marked from 'marked';

const defaultString = '# Hi!\n\nHello, **World**!\n\n```ruby\na = "abc"\nb = 2\n```\n\nThis is `code`.  \n`printf` is a method.\n\n`printf`はメソッドです。\n\n1. あれ\n2. それ\n3. どれ\n\n* あれ\n* それ\n* どれ\n';

new Vue({
  el: '#app',
  data: {
    inputText: defaultString,
    outputText: '',
    inputCount: {},
    outputCount: {},
    options: {
      withoutCodeblock: false,
      withoutHeading: false,
      withoutTable: false,
      withListItem: true,
    },
  },
  watch: {
    inputText: function (mdText) {
      this.updateCount(mdText, this.inputCount);
      this.updateOutput(mdText);
    },
    outputText: function (text) {
      this.updateCount(text, this.outputCount);
    },
    options: {
      deep: true,
      handler: function () {
        this.updateOutput(this.inputText);
      },
    },
  },
  created: function () {
    this.updateCount(this.inputText, this.inputCount);
    this.updateOutput(this.inputText);
  },
  methods: {
    updateOutput: function (text) {
      this.outputText = this.getTextFromMarkdown(text);
      this.outputHtml = marked(text);
      this.updateCount(this.outputText, this.outputCount);
    },
    updateCount: function (text, counterObj) {
      const obj = counterObj;
      const newLines = (text.match(/\n/g) || []).length;
      obj.lines = newLines + 1;
      obj.normal = text.length - newLines;
      obj.withoutSpace = (text.match(/\S/g) || []).length;
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
              str += this.getTextFromInlineMarkdown(token.text);
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
        str += this.getTextFromInlineMarkdown(column);
        if (idx !== token.header.length - 1) {
          str += '\t';
        }
      });
      str += '\n';

      token.cells.forEach((cell) => {
        cell.forEach((column, idx) => {
          str += this.getTextFromInlineMarkdown(column);
          if (idx !== cell.length - 1) {
            str += '\t';
          }
        });
        str += '\n';
      });
      str += '\n';

      return str;
    },
    getTextFromInlineMarkdown: function (mdText) {
      const parsed = markdown.parse(mdText);
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
          if (item[0] === 'link_ref') {
            console.log(item);

            const inline = item[1].ref;
            const hatenaReg = /(niconico|google|map|amazon|wikipedia|(a:|f:|b:|d:|h:)?id|question|b:t|g|graph|(b:|d:|h:)?keyword|isbn|asin|rakuten|jan|ean):.+/gm;
            if (this.options.withoutHatenaTag) {
              if (inline.search(hatenaReg) >= 0) return;

              // FIXME: underscore _ 2つが含まれるなどのURLはここに到達できない
              str += inline.replace(/(https?:[^:]*).*/gm, '$1');
              return;
            }
            str += `[${this.normalizeParagraph(item)}]`;
            return;
          }

          str += this.normalizeParagraph(item);
          return;
        }

        if (typeof item === 'string') {
          let addStr = item;
          // FIXME: underscore _ 2つがタグ中に含まれていると、パースの関係でここで削除できない
          if (this.options.withoutHtmlTag) addStr = addStr.replace(/<(?:.|\n)+?>/gm, '');
          str += addStr;
        }

        // console.log(item);
        // console.log(typeof item);
      });

      return str;
    },
  },
});
