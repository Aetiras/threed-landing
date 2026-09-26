import re
import sys, html
src, dst = sys.argv[1], sys.argv[2]
L=[l.rstrip('\r\n') for l in open(src, encoding='utf-8')]
pairs=[(L[i].strip(), L[i+1]) for i in range(0,len(L)-1,2)]
H=297.0
ents=[]; cur=None; ins=False
for c,v in pairs:
    if c=='2' and v.strip()=='ENTITIES': ins=True; continue
    if not ins: continue
    if c=='0':
        if cur: ents.append(cur)
        cur={'type':v.strip(), 'codes':[]} if v.strip() in ('LINE','TEXT') else None
        if v.strip()=='ENDSEC': break
    elif cur is not None: cur['codes'].append((c,v))
cls={'GORUNEN':'g','GIZLI':'h','OLCU':'o','EKSEN':'e','INCE':'i','CERCEVE':'c'}
paths={k:[] for k in cls.values()}; texts=[]
f=lambda x: ('%.2f'%x).rstrip('0').rstrip('.')
for e in ents:
    d={}
    for c,v in e['codes']: d.setdefault(c, v)
    if e['type']=='LINE':
        x1,y1,x2,y2=[float(d[k]) for k in ('10','20','11','21')]
        paths[cls.get(d['8'].strip(),'i')].append(f'M{f(x1)} {f(H-y1)}L{f(x2)} {f(H-y2)}')
    else:
        x=float(d.get('11',d['10'])); y=float(d.get('21',d['20'])); h=float(d['40']); rot=float(d.get('50','0'))
        ha={'0':'start','1':'middle','2':'end'}.get(d.get('72','0').strip(),'start')
        if '11' not in d: x=float(d['10']); y=float(d['20'])
        va=d.get('73','0').strip()
        tr=f' transform="rotate({f(-rot)} {f(x)} {f(H-y)})"' if abs(rot)>0.01 else ''
        db={'2':'central','3':'hanging'}.get(va,'auto')
        cl=' class="dt"' if (re.match(r'^[Ø0-9]',d['1']) and H-y<245) else ''
        texts.append(f'<text{cl} x="{f(x)}" y="{f(H-y)}" font-size="{f(h)}" text-anchor="{ha}"{" dominant-baseline=%s"%chr(34)+db+chr(34) if db!="auto" else ""}{tr}>{html.escape(d["1"])}</text>')
out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" class="sheet-svg" role="img" aria-label="Motor braketi teknik resmi, A3 pafta">']
for k,v in paths.items():
    if v: out.append(f'<path class="{k}" d="{"".join(v)}"/>')
out.append('<g class="t">'+''.join(texts)+'</g></svg>')
open(dst,'w').write(''.join(out))
print(len(''.join(out)), {k:len(v) for k,v in paths.items()}, len(texts))
