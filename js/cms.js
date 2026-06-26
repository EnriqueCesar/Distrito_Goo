export const files={
  config:'data/config.json',wfm:'data/wfm.json',bt:'data/bt.json',ss:'data/ss.json',tbw:'data/tbw.json',links:'data/links.json',eventos:'data/eventos.json',
  semanales:'data/actividades_semanales.json',diarias:'data/actividades_diarias.json',dutyRoster:'data/duty_roster.json',dutyDetail:'data/duty_detail.json',apertura:'data/checklist_apertura.json',
  birthdays:'data/birthdays.json',anniversaries:'data/anniversaries.json'
};
export async function loadCMS(){const entries=await Promise.all(Object.entries(files).map(async([k,u])=>[k,await fetch(u,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[])]));return Object.fromEntries(entries)}
