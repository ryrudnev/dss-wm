/* eslint-disable max-len */

export function renderFullPage(html, host, port, initialState = null) {
  // Add bundle.css for server side rendering and start:prod
  const bundleCSS = initialState !== null || process.env.NODE_ENV === 'production'
      ? `<link rel="stylesheet" type="text/css" href="http://${host}:${port}/dist/bundle.css"></style>`
      : '';

  return `
    <!DOCTYPE html>
    <meta charset="utf-8">
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1.0, minimum-scale=1.0, maximum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="shortcut icon" href="favicon.ico">
        ${bundleCSS}
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState || {})};
        </script>
        <script src="http://${host}:${port}/dist/bundle.js"></script>
      </body>
    </html>
    `;
}
