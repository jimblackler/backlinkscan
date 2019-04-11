function fetchPage(url, links, blcontinue) {
  return fetch(blcontinue ? url + '&blcontinue=' + blcontinue : url).then(response => response.json()).then(data => {
    for (const link of data.query.backlinks) {
      links.add(link.title);
    }
    if ('continue' in data) {
      return fetchPage(url, links, data.continue.blcontinue);
    }
  })
}

function getCanonical(page) {
  return fetch('https://en.wikipedia.org/w/api.php?action=query&redirects&format=json&titles=' + page)
      .then(response => response.json()).then(data => {
        return data.query.redirects[0].to;
      })
}

function scan() {
  const page = document.location.pathname.replace('/wiki/', '');
  const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=backlinks&bllimit=500&bltitle=' + page;
  const links = new Set();
  fetchPage(url, links).then(() => {
    const anchors = document.evaluate(
        "//div[@role='main']//a", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, length = anchors.snapshotLength; i < length; ++i) {
      const anchor = anchors.snapshotItem(i);
      if (anchor.origin === document.location.origin && anchor.pathname !== document.location.pathname && !anchor.search
          && !anchor.pathname.includes('Wikipedia:') && !anchor.pathname.includes('Help:')) {
        const page2 = decodeURIComponent(anchor.pathname.replace('/wiki/', '').split('_').join(' '));
        if (anchor.classList.contains('mw-redirect')) {
          getCanonical(page2).then(canonical => {
            if (links.has(canonical)) {
              anchor.style.background = 'yellow';
            } else {
              anchor.style.background = 'pink';
            }
          });
        } else if (links.has(page2)) {
          anchor.style.background = 'lightgreen';
        } else {
          anchor.style.background = 'pink';
        }
      }
    }
  });
}

scan();