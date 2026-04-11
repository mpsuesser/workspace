import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const liveExtensionsDir = resolve(process.env.HOME ?? '', '.config/raycast/extensions');
const outputPath = join(repoRoot, 'extensions.manifest.json');

if (!process.env.HOME) {
  console.error('HOME is not set');
  process.exit(1);
}

if (!existsSync(liveExtensionsDir)) {
  console.error(`No Raycast extensions directory found at ${liveExtensionsDir}`);
  process.exit(1);
}

const extensions = readdirSync(liveExtensionsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'node_modules')
  .map((entry) => {
    const id = entry.name;
    const packageJsonPath = join(liveExtensionsDir, id, 'package.json');

    let pkg = {};
    try {
      pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    } catch {
      pkg = {};
    }

    return {
      id,
      name: pkg.name ?? null,
      title: pkg.title ?? null,
      owner: pkg.owner ?? pkg.author ?? null,
      commandCount: Array.isArray(pkg.commands) ? pkg.commands.length : 0,
      toolCount: Array.isArray(pkg.tools) ? pkg.tools.length : 0,
    };
  })
  .sort((a, b) => {
    const aName = (a.name ?? a.title ?? a.id).toLowerCase();
    const bName = (b.name ?? b.title ?? b.id).toLowerCase();
    return aName.localeCompare(bName) || a.id.localeCompare(b.id);
  });

const manifest = {
  liveExtensionsDir: '~/.config/raycast/extensions',
  extensionCount: extensions.length,
  extensions,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${extensions.length} Raycast extensions to ${outputPath}`);
