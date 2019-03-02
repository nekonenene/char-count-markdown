import Vue from 'vue';
import { markdown } from 'markdown';

console.log(markdown.parse('Hello **World**!'));

window.onload = () => {
  $('.output').html('出力部<br>');
  console.log('start');
};

new Vue({
  el: '#app',
  data: {
    inputText: '# Hi!\n\nHello **World**!',
  },
  watch: {
    inputText: function (val) {
      const parsed = markdown.parse(val);
      console.log(parsed);
      this.outputText = parsed.join('\n');
    },
  },
});
