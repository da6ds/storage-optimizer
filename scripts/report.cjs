/**
 * Minimal report: reads /data/fake/files.json and /config/pricing.yaml,
 * writes /out/report.md and /out/report.csv. Very simple math for now.
 */
const fs = require('fs'), path = require('path');

function parseYAML(y){
  // tiny YAML reader for simple "key: value" shapes
  const lines = y.split(/\r?\n/);
  const out = {}; let cur;
  for (const ln of lines){
    if (!ln.trim() || ln.trim().startsWith('#')) continue;
    if (/^\s*providers:\s*$/.test(ln)) { cur = out.providers = {}; continue; }
    const mProv = ln.match(/^\s{2}([a-z_]+):\s*(\{.*\})?\s*$/);
    if (mProv){
      const k = mProv[1]; cur[k] = {};
      if (mProv[2]){
        try { Object.assign(cur[k], eval('(' + mProv[2] + ')')); } catch {}
      }
      continue;
    }
    const mKV = ln.match(/^\s{4}([a-zA-Z_]+):\s*"(.*)"\s*$/) || ln.match(/^\s{4}([a-zA-Z_]+):\s*(.+)\s*$/);
    if (mKV && cur){
      const [,k,vRaw] = mKV;
      let v = vRaw;
      if (/^[0-9.]+$/.test(vRaw)) v = Number(vRaw);
      cur[Object.keys(cur).slice(-1)[0]][k] = v;
    }
  }
  return out;
}

const files = JSON.parse(fs.readFileSync('data/fake/files.json','utf8'));
const pricingYaml = fs.readFileSync('config/pricing.yaml','utf8');
const pricing = parseYAML(pricingYaml).providers || {};

const GB = 1024**3;
const usage = {}; // provider -> bytes
for (const f of files){
  usage[f.provider] = (usage[f.provider]||0) + (f.size_bytes||0);
}

function estCost(provider){
  const p = pricing[provider]; if (!p) return {plan:'(sample missing)', cost: 0, note:'no pricing'};
  const usedGB = (usage[provider]||0)/GB;
  const inc = Number(p.included_gb||0);
  const base = Number(p.base_usd_per_month||0);
  const overRate = Number(p.overage_usd_per_gb||0);
  const over = Math.max(0, usedGB - inc);
  return { plan: p.plan||'(sample)', cost: +(base + over*overRate).toFixed(2), usedGB: +usedGB.toFixed(2) };
}

// duplicates by hash
const groups = files.reduce((acc,f)=>{
  const k = f.hash || `${f.size_bytes}-${f.mime}`;
  (acc[k] ||= []).push(f);
  return acc;
}, {});
const dupes = Object.values(groups).filter(g=>g.length>1).slice(0,100);

fs.mkdirSync('out', { recursive: true });

// Markdown
let md = `# Storage Report (Simulation)\n\n## Costs by provider\n\n| Provider | Plan | Used (GB) | Est. $/mo |\n|---|---|---:|---:|\n`;
for (const prov of Object.keys(usage)){
  const row = estCost(prov);
  md += `| ${prov} | ${row.plan} | ${row.usedGB ?? 0} | ${row.cost} |\n`;
}
md += `\n## Duplicate clusters (showing up to 100)\n`;
md += `Found ${dupes.length} clusters. Example:\n\n`;
for (const g of dupes.slice(0,5)){
  md += `- Hash ${g[0].hash}: ${g.length} files across ${[...new Set(g.map(x=>x.provider))].join(', ')}\n`;
}
fs.writeFileSync('out/report.md', md);

// CSV
let csv = `provider,plan,used_gb,est_usd_per_month\n`;
for (const prov of Object.keys(usage)){
  const row = estCost(prov);
  csv += `${prov},"${row.plan}",${row.usedGB ?? 0},${row.cost}\n`;
}
fs.writeFileSync('out/report.csv', csv);

console.log('✔ Wrote out/report.md and out/report.csv (simulation).');
