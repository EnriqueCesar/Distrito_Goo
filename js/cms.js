export const files = {
  links: 'data/links.json',
  eventos: 'data/eventos.json',
  semanales: 'data/actividades_semanales.json',
  diarias: 'data/actividades_diarias.json',
  dutyRoster: 'data/duty_roster.json',
  dutyDetail: 'data/duty_detail.json',
  bt: 'data/bt.json',
  ss: 'data/ss.json',
  tbw: 'data/tbw.json',
  checklistApertura: 'data/checklist_apertura.json'
};

export async function loadCMS() {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, url]) => {
      try {
        const versioned = `${url}?v=${Date.now()}`;
        const response = await fetch(versioned, { cache: 'no-store' });
        return [key, response.ok ? await response.json() : []];
      } catch {
        return [key, []];
      }
    })
  );
  return Object.fromEntries(entries);
}
