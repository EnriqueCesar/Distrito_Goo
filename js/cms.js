export const files={
  links:'data/links.json',
  eventos:'data/eventos.json',
  semanales:'data/actividades_semanales.json',
  diarias:'data/actividades_diarias.json',
  dutyRoster:'data/duty_roster.json',
  dutyDetail:'data/duty_detail.json'
};
export async function loadCMS(){
  const entries=await Promise.all(Object.entries(files).map(async([k,u])=>[k,await fetch(u,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[])]));
  return Object.fromEntries(entries);
}
