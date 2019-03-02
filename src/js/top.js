import Vue from 'vue';
import { markdown } from 'markdown';

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
      const parsed = markdown.parse(text);
      console.log(parsed);
      this.outputText = this.getTextByParsedArray(parsed);
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
        if (typeof item === 'string') {
          str += item;
        } else {
          str += this.normalizeParagraph(item);
        }
      });

      return str;
    },
  },
});
