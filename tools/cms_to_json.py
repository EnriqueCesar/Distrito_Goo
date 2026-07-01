#!/usr/bin/env python3
"""Convertir Distrito_Go_CMS.xlsx a JSON para Distrito GO.
Uso:
  python tools/cms_to_json.py Distrito_Go_CMS.xlsx data/
"""
import argparse, datetime, json, re, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

NS={'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
SHEET_TO_FILE={
    'Links':'links.json','Eventos':'eventos.json','Actividades_Semanales':'actividades_semanales.json',
    'Actividades_Diaria':'actividades_diarias.json','Duty_Roster':'duty_roster.json','Duty_Detail':'duty_detail.json',
    'BT':'bt.json','SS':'ss.json','TBW':'tbw.json','Checklist_Apertura':'checklist_apertura.json','WFM':'wfm.json'
}

def col_to_idx(cell):
    m=re.match(r'([A-Z]+)',cell); n=0
    for ch in m.group(1): n=n*26+ord(ch)-64
    return n-1

def excel_date(v):
    n=float(v); d=datetime.datetime(1899,12,30)+datetime.timedelta(days=n)
    return d.strftime('%Y-%m-%d') if abs(n-int(n))<1e-9 else d.isoformat()

def norm(v):
    return re.sub(r'\s+',' ',str(v or '').lower().translate(str.maketrans('áéíóúüñ','aeiouun'))).strip()

def parse_xlsx(path):
    with zipfile.ZipFile(path) as z:
        shared=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            root=ET.fromstring(z.read('xl/sharedStrings.xml'))
            shared=[''.join(t.text or '' for t in si.findall('.//a:t',NS)) for si in root.findall('a:si',NS)]
        date_styles=set()
        if 'xl/styles.xml' in z.namelist():
            st=ET.fromstring(z.read('xl/styles.xml')); custom={}; built={14,15,16,17,22,27,30,36,50,57}
            nfroot=st.find('a:numFmts',NS)
            if nfroot is not None:
                for nf in nfroot.findall('a:numFmt',NS): custom[int(nf.attrib['numFmtId'])]=nf.attrib.get('formatCode','')
            xfs=st.find('a:cellXfs',NS)
            if xfs is not None:
                for i,xf in enumerate(xfs.findall('a:xf',NS)):
                    num=int(xf.attrib.get('numFmtId',0)); fmt=custom.get(num,'')
                    if num in built or re.search(r'[dmyhHsS]',fmt): date_styles.add(i)
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        targets={rel.attrib['Id']:rel.attrib['Target'] for rel in rels}
        data={}
        for s in wb.find('a:sheets',NS):
            name=s.attrib['name']; target='xl/'+targets[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
            root=ET.fromstring(z.read(target)); rows=[]
            for row in root.findall('.//a:sheetData/a:row',NS):
                vals=[]
                for c in row.findall('a:c',NS):
                    idx=col_to_idx(c.attrib['r'])
                    while len(vals)<=idx: vals.append('')
                    t=c.attrib.get('t'); style=int(c.attrib.get('s',-1)); v=c.find('a:v',NS); inline=c.find('a:is',NS)
                    if t=='s' and v is not None: val=shared[int(v.text)]
                    elif t=='inlineStr' and inline is not None: val=''.join(tt.text or '' for tt in inline.findall('.//a:t',NS))
                    elif v is not None:
                        val=v.text or ''
                        if style in date_styles and val!='': val=excel_date(val)
                        else:
                            try:
                                f=float(val); val=int(f) if f.is_integer() else f
                            except Exception: pass
                    else: val=''
                    vals[idx]=val.strip() if isinstance(val,str) else val
                while vals and vals[-1]=='': vals.pop()
                if any(str(x).strip() for x in vals): rows.append(vals)
            if not rows: data[name]=[]; continue
            headers=[str(h).strip() for h in rows[0]]; objects=[]
            for vals in rows[1:]:
                obj={h:vals[i] for i,h in enumerate(headers) if h and i < len(vals) and vals[i] not in ('',None)}
                if obj: objects.append(obj)
            data[name]=objects
        return data

def enrich_events(rows):
    out=[]; seen=set()
    for e in rows:
        text=norm(str(e.get('Actividad',''))+' '+str(e.get('Contexto / Recordatorio','')))
        if 'inventario' in text and ('tpv' in text or 'pin pad' in text):
            q='Q4' if 'q4' in text else 'Q3' if 'q3' in text else str(e.get('Fecha Inicio',''))
            key='inventario_'+q
            if key in seen: continue
            seen.add(key)
            e['Actividad']='💳 Inventario TPV y Pin Pads '+q if q in ('Q3','Q4') else '💳 Inventario TPV y Pin Pads'
            e['Imagen']='💳'
        if 'cdd_3q' in text or 'conversaciones' in text or 'pdp' in text:
            key='cdd_q3'
            if key in seen: continue
            seen.add(key)
            e.update({'Fecha Inicio':'2026-07-01','Fecha Fin':'2026-08-02','Actividad':'📖 Conversaciones de Desempeño y Desarrollo Q3','Contexto / Recordatorio':'Seguimiento y/o impulso a los objetivos de PDP. Periodo del 1 de julio al 2 de agosto.','Imagen':'📖','ImagenDetalle':'cdd_3Q_2026.png'})
        if 'barista champion' in text: e['ImagenDetalle']='hugo-barista-champion.jpeg'
        if 'autoica' in text: e.update({'URL':'https://ica-stage.bw-globalsolutions.com/Login.php','Link':'Abrir revisión AutoICA'})
        if 'corte de nomina' in text or 'nomina' in text: e.update({'URL':'https://ejlw.login.us2.oraclecloud.com/','Link':'Abrir Oracle HCM'})
        m=re.search(r'https?://\S+',str(e.get('Contexto / Recordatorio','')))
        if m and not e.get('URL'): e.update({'URL':m.group(0),'Link':'Abrir liga'})
        out.append(e)
    if not any('conversaciones de desempeno' in norm(x.get('Actividad','')) for x in out):
        out.append({'Fecha Inicio':'2026-07-01','Fecha Fin':'2026-08-02','Actividad':'📖 Conversaciones de Desempeño y Desarrollo Q3','Contexto / Recordatorio':'Seguimiento y/o impulso a los objetivos de PDP. Periodo del 1 de julio al 2 de agosto.','Imagen':'📖','ImagenDetalle':'cdd_3Q_2026.png'})
    return sorted(out,key=lambda x:(str(x.get('Fecha Inicio','9999')),str(x.get('Actividad',''))))

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('xlsx'); ap.add_argument('outdir', nargs='?', default='data')
    args=ap.parse_args(); outdir=Path(args.outdir); outdir.mkdir(parents=True,exist_ok=True)
    data=parse_xlsx(args.xlsx); combined={}
    for sheet,filename in SHEET_TO_FILE.items():
        rows=enrich_events(data.get(sheet,[])) if sheet=='Eventos' else data.get(sheet,[])
        (outdir/filename).write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
        combined[Path(filename).stem]=rows
    for optional in ['birthdays.json','anniversaries.json']:
        p=outdir/optional
        if not p.exists(): p.write_text('[]',encoding='utf-8')
    (outdir/'cms.json').write_text(json.dumps(combined,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'JSON generado en {outdir}')
if __name__=='__main__': main()
