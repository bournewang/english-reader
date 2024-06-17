const chokidar = require('chokidar');
const chromeExtensionReloader = require('chrome-extension-reloader');

// Replace 'your-extension-id' with your actual extension ID from Chrome
const EXTENSION_ID = 'mphjbhnoibkagbncmoiibjbakfdcmgdj';

chromeExtensionReloader({
  extensionId: EXTENSION_ID,
  // Optionally specify a port if you're running a custom local server
  port: 3000
});

// Initialize the watcher
const watcher = chokidar.watch('./', {
  ignored: /node_modules|\.git/,
  persistent: true
});

watcher.on('change', (path) => {
  console.log(`File ${path} has been changed. Reloading extension...`);
  chromeExtensionReloader.reload();
});
