// Writes the user guide (src/features/user-guide/content) to
// backend/resources/user-guide/user-guide.json, where the backend's MCP server
// reads it to answer "how do I…" questions. The TypeScript content stays the
// single source; run this after editing it: npm run user-guide:export
// (`npm run user-guide:export -- --check` fails when the JSON is out of date).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'src/features/user-guide/content/index.ts');
const target = path.resolve(
  root,
  '../backend/resources/user-guide/user-guide.json',
);

const { module } = await runnerImport(source, {
  configFile: false,
  logLevel: 'silent',
});

const chapters = module.USER_GUIDE_CHAPTERS.map(
  ({ id, title, description, topics }) => ({ id, title, description, topics }),
);
const json = `${JSON.stringify({ chapters }, null, 2)}\n`;

if (process.argv.includes('--check')) {
  let current = '';

  try {
    current = readFileSync(target, 'utf8');
  } catch {
    // A missing file is out of date as well.
  }

  if (current !== json) {
    console.error(
      'backend/resources/user-guide/user-guide.json is out of date: run npm run user-guide:export',
    );
    process.exit(1);
  }

  console.log('User guide export is up to date.');
} else {
  writeFileSync(target, json);
  console.log(`Wrote ${path.relative(process.cwd(), target)}`);
}
