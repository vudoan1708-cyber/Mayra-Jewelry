#!/usr/bin/env node
const chokidar = require('chokidar');
const { exec } = require('child_process');

const WATCH_DIR = './';          // Root of your project
const DOCKER_COMMAND_UP = 'docker compose up --build';
const DOCKER_COMMAND_DOWN = 'docker compose down';
const DEBOUNCE_MS = 500;        // Wait 500ms after last change before rebuild

let timeout = null;

console.log('Watching for changes in .go files...');

const watcher = chokidar.watch(WATCH_DIR, {
  ignored: /node_modules|\.git/, // ignore common folders
  persistent: true,
  ignoreInitial: true,
  depth: 99,
});

const runCommand = (cmd) => {
  const child = exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error rebuilding container: ${err.message}`);
      return;
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
};
runCommand(DOCKER_COMMAND_UP);

watcher.on('all', (event, path) => {
  if (!path.endsWith('.go')) return;

  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    runCommand(DOCKER_COMMAND_DOWN);

    console.log(`Detected changes in ${path}, rebuilding Docker container...`);
    runCommand(DOCKER_COMMAND_UP);
  }, DEBOUNCE_MS);
});
