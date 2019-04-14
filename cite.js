
do {
  const textarea = document.createElement('textarea');
  const title = document.title.split('|').join('&#124;');
  const text = `<ref>{{cite web|title=${title}|url=${document.location.href}}}</ref>`;
  textarea.appendChild(document.createTextNode(text));
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
} while(0);