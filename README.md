react-server-example
--------------------

Forked from [mhart/react-server-example](https://github.com/mhart/react-server-example)

## Use

```
npm install
npm start
```

The application should render a simple page with a few list items at `localhost:3000`. Once the page is open in the browser, it should hydrate itself and become interactive - you should be able to add new items by clicking on a button. Notice both the rendered items and `window.APP_PROPS` in the returned HTML

```text
$ http localhost:3000
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 676
Content-Type: text/html; charset=utf-8
Date: Tue, 14 May 2019 01:32:41 GMT

<body><div id="content"><div data-reactroot=""><button disabled="">Add Item</button><ul><li>Item 0</li><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></div></div><script>var APP_PROPS = {"items":["Item 0","Item 1","Item 2","Item 3"]};</script><script src="https://cdn.jsdelivr.net/npm/react@16.7.0/umd/react.production.min.js"></script><script src="https://cdn.jsdelivr.net/npm/react-dom@16.7.0/umd/react-dom.production.min.js"></script><script src="https://cdn.jsdelivr.net/npm/react-dom-factories@1.0.2/index.min.js"></script><script src="https://cdn.jsdelivr.net/npm/create-react-class@15.6.3/create-react-class.min.js"></script><script src="/bundle.js"></script></body>
```
