const { spawnSync } = require('node:child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    process.stderr.write('Could not parse the PostToolUse event.\n');
    process.exitCode = 2;
    return;
  }

  const toolName = typeof event.tool_name === 'string' ? event.tool_name : '';
  if (!/(edit|write|patch|create|replace|insert|rename|delete)/i.test(toolName)) {
    return;
  }

  const result = spawnSync('npm', ['test'], {
    cwd: require('node:path').resolve(__dirname, '../../unit-test'),
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.error) {
    process.stderr.write(`${result.error.message}\n`);
    process.exitCode = 2;
  } else if (result.status !== 0) {
    process.exitCode = 2;
  }
});