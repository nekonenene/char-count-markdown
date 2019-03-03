import Vue from 'vue';
import { markdown } from 'markdown';
import marked from 'marked';

const defaultString = '# Hi!\n\nHello, **World**!\n\n```ruby\na = "abc"\nb = 2\n```\n\nThis is `code`.  \n`printf` is a method.\n\n`printf`はメソッドです。\n\n1. あれ\n2. それ\n3. どれ\n\n* あれ\n* それ\n* どれ\n';

new Vue({
  el: '#app',
  data: {
    inputText: defaultString,
  },
  watch: {
    inputText: function (val) {
      this.updateOutput(val);
    },
  },
  created: function () {
    this.updateOutput(this.inputText);
  },
  methods: {
    updateOutput: function (text) {
      this.outputText = this.getTextFromMarkdown(text);
      this.outputHtml = marked(text);
    },
    getTextFromMarkdown(mdStr) {
      let str = '';

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
            str += token.text;
            str += '\n\n';
            break;
          default:
            if (token.text != null) {
              const parsed = markdown.parse(token.text);
              const text = this.getTextByParsedArray(parsed);
              str += text;
              str += '\n';
              if (token.type === 'heading') str += '\n';
            }
            break;
        }
      });

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
          str += this.normalizeParagraph(item);
          return;
        }

        if (typeof item === 'string') {
          str += item;
          return;
        }

        console.log(item);
        console.log(typeof item);
      });

      return str;
    },
  },
});
