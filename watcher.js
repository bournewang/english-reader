// watcher.js
const chokidar = require('chokidar');
const CDP = require('chrome-remote-interface');

// Path to your extension directory
const EXTENSION_PATH = '/path/to/your/extension';

// Watch for changes in the extension directory
chokidar.watch(EXTENSION_PATH, { ignored: /(^|[\/\\])\../ }).on('all', (event, path) => {
  console.log(event, path);
  reloadExtension();
});

async function reloadExtension() {
  let client;
  try {
    client = await CDP();
    const { Runtime } = client;
    await Runtime.evaluate({ expression: 'chrome.runtime.reload()' });
  } catch (err) {
    console.error(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}
