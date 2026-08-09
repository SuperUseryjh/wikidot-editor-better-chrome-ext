import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as esbuild from 'esbuild';

const root = resolve(import.meta.dir, '..');
const packageJson = await Bun.file(resolve(root, 'package.json')).json() as { description: string; version: string; chrome: { name: string; match: string[] } };
const extensionDirectory = resolve(root, 'dist');
mkdirSync(extensionDirectory, { recursive: true });
for (const [entryPoint, outfile] of [
    ['bootstrapMain.js', 'content.js'],
    ['extension/contentBridge.js', 'content-bridge.js'],
    ['extension/background.js', 'background.js'],
] as const) {
    await esbuild.build({
        entryPoints: [resolve(root, 'dist', entryPoint)],
        bundle: true,
        outfile: resolve(extensionDirectory, outfile),
        format: 'iife',
        platform: 'browser',
    });
}
writeFileSync(resolve(extensionDirectory, 'manifest.json'), JSON.stringify({
    manifest_version: 3,
    name: packageJson.chrome.name,
    version: packageJson.version,
    description: packageJson.description,
    permissions: ['cookies', 'storage'],
    host_permissions: ['https://*.wikidot.com/*'],
    background: { service_worker: 'background.js' },
    content_scripts: [
        { matches: packageJson.chrome.match, js: ['content-bridge.js'], run_at: 'document_start' },
        { matches: packageJson.chrome.match, js: ['content.js'], run_at: 'document_start', world: 'MAIN' },
    ],
}, null, 2) + '\n');
