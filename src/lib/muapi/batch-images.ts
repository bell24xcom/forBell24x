/**
 * VyaparSethu — MuAPI batch image generator
 * Generates category promotional images and saves metadata to public/assets/.
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/lib/muapi/batch-images.ts
 * Requires: MUAPI_API_KEY env var + account credits on muapi.ai
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';

const MUAPI_KEY  = process.env.MUAPI_API_KEY ?? '';
const BASE_URL   = 'https://api.muapi.ai/api/v1';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'assets');

interface ImageJob {
  filename: string;
  prompt:   string;
  width:    number;
  height:   number;
}

const JOBS: ImageJob[] = [
  {
    filename: 'steel.png',
    prompt:   'Close-up of raw industrial structural steel beams stacked neatly inside a Mumbai shipping yard. Cinematic volumetric lighting, deep navy metallic shadows, subtle gold highlights, crisp 8k detail. Premium B2B trade photography.',
    width:    1080,
    height:   1350,
  },
  {
    filename: 'textiles.png',
    prompt:   'High-end product showcase of premium organic Indian cotton yarn rolls on a clean minimal wooden table. Swirl bokeh portrait background, soft window light, rich fabric textures. Professional trade photography.',
    width:    1080,
    height:   1350,
  },
  {
    filename: 'packaging.png',
    prompt:   'Close-up of strong brown corrugated packaging boxes arranged elegantly. Modern trade presentation, balanced depth of field, premium industrial aesthetic. Clean studio background.',
    width:    1080,
    height:   1350,
  },
];

async function submitImageJob(job: ImageJob): Promise<string> {
  const res = await fetch(`${BASE_URL}/flux-dev-image`, {
    method:  'POST',
    headers: { 'x-api-key': MUAPI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt:       job.prompt,
      aspect_ratio: '4:5',
      width:        job.width,
      height:       job.height,
      num_outputs:  1,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Submit failed: ${JSON.stringify(data)}`);
  return data.request_id as string;
}

async function pollResult(requestId: string, maxWait = 120): Promise<string> {
  const interval = 5;
  let elapsed    = 0;

  while (elapsed < maxWait) {
    await new Promise(r => setTimeout(r, interval * 1000));
    elapsed += interval;

    const res  = await fetch(`${BASE_URL}/predictions/${requestId}/result`, {
      headers: { 'x-api-key': MUAPI_KEY },
    });
    const data = await res.json();

    if (data.status === 'completed') {
      const url = data.outputs?.[0] ?? data.output?.[0] ?? data.image_url;
      if (!url) throw new Error('Completed but no output URL');
      return url as string;
    }
    if (data.status === 'failed') throw new Error(`Job failed: ${data.error}`);

    console.log(`  [${elapsed}s] ${requestId.slice(0, 8)}… ${data.status}`);
  }

  throw new Error(`Timed out after ${maxWait}s`);
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function run() {
  if (!MUAPI_KEY) { console.error('MUAPI_API_KEY not set'); process.exit(1); }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Submitting ${JOBS.length} image jobs to MuAPI (flux-dev-image)…\n`);

  const submitted = await Promise.all(
    JOBS.map(async job => {
      const requestId = await submitImageJob(job);
      console.log(`✓ Submitted ${job.filename} — ${requestId}`);
      return { job, requestId };
    }),
  );

  console.log('\nPolling for results…\n');

  for (const { job, requestId } of submitted) {
    try {
      const imageUrl = await pollResult(requestId);
      const dest     = path.join(OUTPUT_DIR, job.filename);
      await downloadFile(imageUrl, dest);
      console.log(`✓ ${job.filename} saved → public/assets/${job.filename}`);
    } catch (err) {
      console.error(`✗ ${job.filename}: ${(err as Error).message}`);
    }
  }

  console.log('\nBatch image generation complete.');
}

run().catch(e => { console.error(e); process.exit(1); });
