/* eslint-disable max-len */
import config from '../../config';
import fs from 'fs';

export function renderFullPage(host = config.host, port = config.port, title = 'DSS WM', html = '') {
  const bundleCSS = config.isProd
      ? `<link rel="stylesheet" href="http://${host}:${port}/dist/bundle.css"></style>`
      : '';

  return `
    <!DOCTYPE html>
    <meta charset="utf-8">
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1.0, minimum-scale=1.0, maximum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <link rel="shortcut icon" href="/dist/favicon.ico">
        ${bundleCSS}
      </head>
      <body>
        <div id="app">${html}</div>
        <script src="http://${host}:${port}/dist/bundle.js"></script>
      </body>
    </html>
    `;
}

export function buildHtml(...args) {
  const html = renderFullPage.apply(this, args);
  return new Promise((resolve, reject) => {
    fs.writeFile('dist/index.html', html, 'utf8', (writeError) => {
      if (writeError) {
        console.error(writeError);
        return reject();
      }
      console.log('index.html written to /dist');
      return resolve();
    });
  });
}
