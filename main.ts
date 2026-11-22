// THE VELVET VAULT — make.fun entry program (Node 22, standard library
// only). The game is plain static files under game/ plus 3 or 4 screenshots
// under screenshots/. This program hands them in: it copies both folders
// into the output directory and writes dossier.json there, using the kit's
// vendored buildDossier library. It runs twice in the grader and both runs
// must write the same bytes, so it does no work that depends on the time,
// the machine or the network — only copies and the dossier build.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps for this bounty: no more than 4 screenshots, none
// over 256 KiB; game/ holds at most 993 files and 48 MiB in all, and no
// path under game/ is longer than 1000 bytes. The dossier text is capped
// at 160 KiB.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn() {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), {
      recursive: true,
    });
  }
  const dossier = buildDossier(outDir, dossierCaps);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
