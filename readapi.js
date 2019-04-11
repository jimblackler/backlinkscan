function process() {
  const page = document.location.pathname.replace('/wiki/', '');
  const url = 'https://en.wikipedia.org/w/api.php?prop=links&format=json&action=parse&page=' + page;
  fetch(url).then(response => response.json()).then(data => {
    const links = new Set();
    for (link of data.parse.links) {
      links.add(link['*']);
    }
    console.log(links);
  })
}

process();