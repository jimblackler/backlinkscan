function fetchBacklinkPage(url, links, blcontinue) {
  return fetch(blcontinue ? url + '&blcontinue=' + blcontinue : url).then(response => response.json()).then(data => {
    for (const link of data.query.backlinks) {
      links.add(link.title);
    }
    if ('continue' in data) {
      return fetchBacklinkPage(url, links, data.continue.blcontinue);
    }
  })
}

function getBacklinks(page, links) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=backlinks&bllimit=500&bltitle=' + page;
  return fetchBacklinkPage(url, links);
}

function normalize(url) {
  return decodeURIComponent(url.replace('/wiki/', '').split('_').join(' '));
}

function getRedirects(page) {
  return fetch('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=redirects&rdlimit=500&titles=' + page)
      .then(response => response.json()).then(data => Object.values(data.query.pages)[0].redirects || []);
}

function getInLinks(page, links) {
  return Promise.all([
    getRedirects(page).then(redirects => Promise.all(redirects.map(redirect => getBacklinks(redirect.title, links)))),
    getBacklinks(page, links)]);
}

function getCanonical(page) {
  return fetch('https://en.wikipedia.org/w/api.php?action=query&redirects&limit=1&format=json&titles=' + page)
      .then(response => response.json()).then(data => data.query.redirects[0].to);
}

function scan() {
  const page = document.location.pathname.replace('/wiki/', '');

  const links = new Set();
  getInLinks(page, links).then(() => {
    const anchors = document.evaluate(
        "//div[@role='main']//a", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, length = anchors.snapshotLength; i < length; ++i) {
      const anchor = anchors.snapshotItem(i);
      if (anchor.origin === document.location.origin && anchor.pathname !== document.location.pathname && !anchor.search
          && !anchor.pathname.includes('Wikipedia:') && !anchor.pathname.includes('Help:')) {
        const page2 = normalize(anchor.pathname);
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