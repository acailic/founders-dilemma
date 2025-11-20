import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = __dirname;
const amplifierRoot = process.env.AMPLIFIER_ROOT
  ? path.resolve(process.env.AMPLIFIER_ROOT)
  : path.resolve(projectRoot, '..');
const sourceDir = path.join(projectRoot, 'build');
const docsDir = path.join(amplifierRoot, 'docs');
const targetDir = path.join(docsDir, 'founders-dilemma');

async function ensureBuildOutput() {
  try {
    await stat(sourceDir);
  } catch {
    console.error(`Build output not found at ${sourceDir}. Run "pnpm run build:web" first.`);
    process.exit(1);
  }
}

async function copyBuildToDocs() {
  await mkdir(docsDir, { recursive: true });
  await rm(targetDir, { recursive: true, force: true });
  await cp(sourceDir, targetDir, { recursive: true });
  console.log(`Exported web build to ${targetDir}`);
}

async function main() {
  await ensureBuildOutput();
  await copyBuildToDocs();
}

main().catch((error) => {
  console.error('Failed to export docs build:', error);
  process.exit(1);
});
