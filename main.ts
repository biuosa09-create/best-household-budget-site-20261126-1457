// Dompet Keluarga — hand-in for best-household-budget-site-20261126-1457.
//
// This program assembles the finished entry and nothing else: it takes the
// site in app/ and the renders in screenshots/ from beside this file, lays
// them out under the output folder, and asks the vendored dossier builder to
// write dossier.json there — the summary the judge reads when scoring.
//
// The output folder belongs to the grader, so this program never removes it:
// it only creates it if missing and overwrites the single dossier file it
// writes. Removing the folder itself would fail where the folder is a mount
// point, and a second run must land cleanly on top of the first.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

mkdirSync(outDir, { recursive: true });

// Copy the site fresh each run: drop the previous app/ copy first so stale
// files from an earlier run cannot survive into this one.
rmSync(join(outDir, 'app'), { recursive: true, force: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });

// Same for the screenshots, then rebuild the dossier from what was copied.
rmSync(join(outDir, 'screenshots'), { recursive: true, force: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The scorer's own caps: the text is capped at 160 KiB, at most 4 screenshots
// of at most 256 KiB each, app/ at most 993 files and 16 MiB in all. The
// dossier must be byte for byte what this call writes.
const dossierPath = join(outDir, 'dossier.json');
rmSync(dossierPath, { force: true });
writeFileSync(
  dossierPath,
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
