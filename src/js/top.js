import { markdown } from 'markdown';

console.log(markdown.parse('Hello **World**!'));

window.onload = () => {
  $('.output').html('出力部<br>');
  console.log('start');
};
