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
      const parsed = markdown.parse(val);
      console.log(parsed);
      this.outputText = parsed.join('\n');
    },
  },
  created: function () {
    this.updateOutput();
  },
  methods: {
    updateOutput: function () {
      const str = this.inputText;
      const parsed = markdown.parse(str);
      console.log(parsed);
      this.outputText = parsed.join('\n');
    },
  },
});
