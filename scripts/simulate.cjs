/**
 * Minimal simulator: writes /data/fake/files.json with mock records.
 * Flags: --providers a,b,c  --seed 42  --count 5000
 */
const fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
const get = (flag, def) => {
  const i = args.indexOf(flag);
  if (i === -1) return def;
  const val = args[i+1]; 
  if (!val || val.startsWith('--')) return def;
  return val;
};
const providers = (get('--providers','local,drive,dropbox,icloud,onedrive')).split(',');
const seed = Number(get('--seed', '42')) || 42;
const count = Number(get('--count','5000')) || 5000;

let s = seed;
const rnd = () => (s = (s*1664525 + 1013904223) % 0x100000000) / 0x100000000;

const mimePool = ['image/jpeg','image/png','video/mp4','application/pdf','text/plain'];
const names = ['photo','video','tax','report','notes','invoice','backup','clip','song','doc'];

fs.mkdirSync('data/fake', { recursive: true });
const rows = [];
for (let i=0;i<count;i++){
  const provider = providers[Math.floor(rnd()*providers.length)];
  const size = Math.floor( (rnd()**2) * 2_000_000_000 ); // skew to many small, some huge
  const daysAgo = Math.floor(rnd()*720); // up to ~2 years
  const ts = Date.now() - daysAgo*24*3600*1000;
  const mime = mimePool[Math.floor(rnd()*mimePool.length)];
  const base = names[Math.floor(rnd()*names.length)];
  const id = `${provider}-${i}`;
  // weak "hash" stand-in so dupes happen across providers
  const dupeKey = Math.floor(rnd()*Math.min(2000, count/10));
  const hash = `h${dupeKey.toString(16).padStart(4,'0')}`;
  rows.push({
    id,
    provider,
    provider_id: id,
    path: `/${provider}/${base}-${i}.${mime.split('/')[1]||'bin'}`,
    size_bytes: size,
    last_modified: new Date(ts).toISOString(),
    hash,
    mime,
    url: null,
    access_tier: null,
    location: 'global'
  });
}
fs.writeFileSync('data/fake/files.json', JSON.stringify(rows,null,2));
console.log(`✔ Wrote data/fake/files.json with ${rows.length} simulated items across ${providers.length} providers.`);
