import re,json,os,sys
os.chdir(sys.argv[1])
spec=json.load(open('raw/openapi.json'))
comp=spec['components']['schemas']
ref=lambda r:r.split('/')[-1]
def shape(s,d=0,seen=()):
    if not isinstance(s,dict): return 'any'
    if d>3: return '…'
    if '$ref' in s:
        n=ref(s['$ref'])
        return n if (n in seen or d>=3) else shape(comp.get(n,{}),d,seen+(n,))
    for k in ('allOf','oneOf','anyOf'):
        if k in s: return (' & ' if k=='allOf' else ' | ').join(shape(x,d,seen) for x in s[k])
    t=s.get('type')
    if t=='array': return '['+shape(s.get('items',{}),d+1,seen)+']'
    if t=='object' or 'properties' in s:
        ps=s.get('properties',{})
        return '{'+', '.join(f'{k}: {shape(v,d+1,seen)}' for k,v in list(ps.items())[:40])+'}' if ps else 'object'
    if 'enum' in s: return f'{t or "string"} enum('+'|'.join(map(str,s['enum']))+')'
    return str(t or 'any')
bytag={}
for p,ops in spec['paths'].items():
    for m,op in ops.items():
        if m in ('get','post','put','patch','delete'):
            for t in op.get('tags',['untagged']): bytag.setdefault(t,[]).append((p,m,op))
os.makedirs('api',exist_ok=True); lines=[]; base='https://api.gitguardian.com/docs'; catalog=[]
for t,ops in sorted(bytag.items()):
    slug=re.sub(r'[^a-z0-9]+','-',t.lower()).strip('-'); tg=t.replace(' ','-')
    out=[f'# API: {t}\n',f'Source: {base}#tag/{tg} (OpenAPI {spec["info"]["version"]}, fetched 2026-10-30). Primary authority for the mock.\n']
    for p,m,op in ops:
        oid=op.get('operationId','')
        catalog.append({'tag':t,'method':m.upper(),'path':p,'operationId':oid,'ref':f'{base}#tag/{tg}/operation/{oid}','summary':op.get('summary','')})
        out.append(f'\n## {m.upper()} {p}\n\n- operationId: `{oid}`\n- ref: {base}#tag/{tg}/operation/{oid}\n- summary: {op.get("summary","")}')
        d=(op.get('description') or '').strip()
        if d: out.append('\n'+d[:1500])
        prm=op.get('parameters',[])
        if prm:
            out.append('\n**Parameters**\n')
            for x in prm:
                if '$ref' in x: x=spec['components']['parameters'][ref(x['$ref'])]
                out.append(f'- `{x["name"]}` ({x["in"]}{", required" if x.get("required") else ""}): {shape(x.get("schema",{}))} — {(x.get("description") or "").strip()[:200]}')
        for ct,c in op.get('requestBody',{}).get('content',{}).items():
            out.append(f'\n**Request body** ({ct}): `{shape(c.get("schema",{}))[:1500]}`')
        for code,r in op.get('responses',{}).items():
            if '$ref' in r: r=spec['components']['responses'][ref(r['$ref'])]
            c=next(iter(r.get('content',{}).values()),None)
            out.append(f'\n**{code}**' + (f': `{shape(c.get("schema",{}))[:1500]}`' if c else f': {r.get("description","")}'))
    open(f'api/{slug}.md','w').write('\n'.join(out)+'\n')
    lines.append(f'- [{t}](api/{slug}.md) — {len(ops)} operations')
json.dump(catalog,open('api_catalog.json','w'),indent=1)
open('API_INDEX.md','w').write('# GitGuardian API reference (local copy)\n\nExtracted from the Redoc spec at https://api.gitguardian.com/docs (OpenAPI '+spec['info']['version']+'). Every mock handler cites an operationId from these files.\n\n'+'\n'.join(lines)+'\n')
print(len(bytag),'tags',len(catalog),'ops')
