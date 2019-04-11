function fetchRetry(url, options, attempts) {
  return fetch(url, options).catch(error => {
    if (attempts === 1) {
      throw error;
    }
    return fetchRetry(url, options, attempts - 1);
  });
}

function process(anchor) {
  anchor.style.background = 'orange';
  fetchRetry(anchor.pathname, {}, 5)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const template = parser.parseFromString('<base href=' + anchor.href + '>' + html, 'text/html');
        const other_anchors = document.evaluate("//div[@role='main']//a", template, null, XPathResult.ANY_TYPE, null);
        let other_anchor = other_anchors.iterateNext();
        while (other_anchor) {
          if (other_anchor.origin === document.location.origin &&
              other_anchor.pathname === document.location.pathname) {
            anchor.title = other_anchor.innerText;
            anchor.style.background = 'lightgreen';
            return;
          }
          other_anchor = other_anchors.iterateNext();
        }
        anchor.style.background = 'pink';
      })
      .catch((error) => {
        anchor.title = error.toString();
        anchor.style.background = 'red';
        anchor.style.color = 'white';
      });
}

function scan() {
  const anchors = document.evaluate("//div[@role='main']//a", document, null, XPathResult.ANY_TYPE, null);
  let anchor = anchors.iterateNext();
  while (anchor) {
    if (anchor.origin === document.location.origin && anchor.pathname !== document.location.pathname && !anchor.search
        && !anchor.pathname.includes('Wikipedia:') && !anchor.pathname.includes('Help:')) {
      process(anchor);
    }
    anchor = anchors.iterateNext();
  }
}

scan();