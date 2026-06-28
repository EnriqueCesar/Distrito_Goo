export const files = {
  links: 'data/links.json',
  eventos: 'data/eventos.json',
  semanales: 'data/actividades_semanales.json',
  diarias: 'data/actividades_diarias.json',
  dutyRoster: 'data/duty_roster.json',
  dutyDetail: 'data/duty_detail.json'
};

export async function loadCMS() {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, url]) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        return [key, response.ok ? await response.json() : []];
      } catch {
        return [key, []];
      }
    })
  );
  return Object.fromEntries(entries);
}
