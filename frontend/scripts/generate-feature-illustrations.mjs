// Generates flat-vector-illustration character art for the app's top-tier
// feature cards (Home's 4 practice categories + Practice hub's 4 modes),
// via the same Gemini image endpoint used earlier for archetype/scenario
// photos. Saves to assets/generated/features/<id>.jpg.
//
// Idempotent (skips ids that already have a file — safe to re-run after a
// partial quota failure), retries 429s with backoff, does one cheap test
// call before the full batch, and always exits 0 with a summary — a partial
// or total failure must never block the rest of the redesign pass, since
// every card gracefully falls back to an icon+color treatment when its
// illustration is missing (see ThemedFeatureCard.tsx).
//
// Usage: node scripts/generate-feature-illustrations.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../assets/generated/features');
const ENV_FILE = path.join(__dirname, '../../backend/.env');

function loadGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (!fs.existsSync(ENV_FILE)) return undefined;
  const raw = fs.readFileSync(ENV_FILE, 'utf-8');
  for (const line of raw.split('\n')) {
    const match = line.match(/^GEMINI_API_KEY=(.*)$/);
    if (match) return match[1].trim();
  }
  return undefined;
}

const STYLE_PREFIX =
  'Flat vector illustration, single confident character, clean geometric shapes, ' +
  'no text, no logos, centered composition, soft rounded forms, minimal shading, ' +
  'friendly modern app-illustration style, 1:1 square aspect ratio.';

// id -> subject line + background hex (matches this feature's cardCategories
// color in ThemeContext.tsx, so the illustration reads as "belonging" to
// its card even before the app tints the card background around it).
const MANIFEST = [
  { id: 'feedback', subject: 'a professional confidently giving feedback across a table', bg: '#5B5FEF' },
  { id: 'boundaries', subject: 'a person calmly setting a boundary with a raised hand', bg: '#EF4444' },
  { id: 'difficult_decisions', subject: 'two professionals resolving a disagreement with a handshake', bg: '#F59E0B' },
  { id: 'negotiation', subject: 'a professional negotiating a raise with confident posture', bg: '#22C55E' },
  { id: 'free', subject: 'a person mid-conversation with a speech-bubble icon', bg: '#0D9488' },
  { id: 'guided', subject: 'a person reviewing a glowing coaching checklist', bg: '#2563EB' },
  { id: 'quick_drill', subject: 'a person tapping a stopwatch beside a multiple-choice card', bg: '#7C3AED' },
  { id: 'custom', subject: 'a person writing their own scenario on a notepad', bg: '#16A34A' }
];

const MODEL = 'gemini-3.1-flash-image-preview';
const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateOne(apiKey, entry) {
  const prompt = `${STYLE_PREFIX} Subject: ${entry.subject}. Background color: ${entry.bg}.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (res.status === 429) {
      if (attempt === MAX_RETRIES) return { ok: false, reason: 'quota exceeded (429)' };
      await sleep(2000 * attempt);
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, reason: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    if (!imagePart) return { ok: false, reason: 'no image data in response' };

    return { ok: true, base64: imagePart.inlineData.data };
  }

  return { ok: false, reason: 'exhausted retries' };
}

async function main() {
  const apiKey = loadGeminiApiKey();
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found (checked env and backend/.env). Aborting.');
    process.exit(0);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const pending = MANIFEST.filter((e) => !fs.existsSync(path.join(OUT_DIR, `${e.id}.jpg`)));
  if (pending.length === 0) {
    console.log('All 8 feature illustrations already exist on disk. Nothing to do.');
    process.exit(0);
  }
  console.log(`${MANIFEST.length - pending.length}/${MANIFEST.length} already on disk, generating ${pending.length} more.`);

  // Single cheap test call first, given this endpoint hit a 429 quota error
  // earlier this session — no point burning the whole batch into the same wall.
  console.log(`Test call for "${pending[0].id}"...`);
  const test = await generateOne(apiKey, pending[0]);
  if (!test.ok) {
    console.error(`Test call failed: ${test.reason}`);
    console.error('Aborting batch — every feature card will use its icon+color fallback until this is retried.');
    process.exit(0);
  }
  fs.writeFileSync(path.join(OUT_DIR, `${pending[0].id}.jpg`), Buffer.from(test.base64, 'base64'));
  console.log(`✓ ${pending[0].id}.jpg`);

  let succeeded = 1;
  let failed = 0;
  for (const entry of pending.slice(1)) {
    const result = await generateOne(apiKey, entry);
    if (result.ok) {
      fs.writeFileSync(path.join(OUT_DIR, `${entry.id}.jpg`), Buffer.from(result.base64, 'base64'));
      console.log(`✓ ${entry.id}.jpg`);
      succeeded++;
    } else {
      console.warn(`✗ ${entry.id}: ${result.reason}`);
      failed++;
    }
    await sleep(1000);
  }

  console.log(`\nDone: ${succeeded}/${pending.length} generated, ${failed} failed (falls back to icon+color).`);
  process.exit(0);
}

main();
