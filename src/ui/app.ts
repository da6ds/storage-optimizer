const content = document.getElementById('content')!;
const tabbar = document.querySelector('.tabbar')!;
const cta = document.getElementById('primaryCta') as HTMLButtonElement;

// simple client-side router for simulation views
const views: Record<string,string> = {
  map:       `<h1>Where your stuff is</h1><p class="muted">Simulated charts/tables will render here.</p>`,
  duplicates:`<h1>Duplicates</h1><p>Groups and keep/delete suggestions (sim).</p>`,
  costs:     `<h1>Monthly Costs</h1><p>Per-provider totals using sample pricing.</p>`,
  actions:   `<h1>Recommendations</h1><p>Potential savings with friction scores.</p>`
};
function render(tab='map'){ content.innerHTML = views[tab] || views.map; }
render();

tabbar.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('button[data-tab]');
  if (!btn) return;
  for (const b of tabbar.querySelectorAll('button')) b.setAttribute('aria-selected','false');
  btn.setAttribute('aria-selected','true');
  render(btn.getAttribute('data-tab')!);
});

// keep CTA disabled in simulation
cta.addEventListener('click', () => alert('Simulation only. No changes made.'));
