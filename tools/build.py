# Assemble docs/*.html from tools/pages + partials. FAQ entries come from tools/faq_ld.json.
import html, json, re, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / 'docs'
HEAD = (ROOT / 'partials/head.html').read_text()
FOOT = (ROOT / 'partials/foot.html').read_text()
VERSION = str(int(time.time()))

FAQ_GROUPS = [
    ('basics', 'The basics', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    ('performance', 'Performance', [25, 11, 42, 57, 28, 16, 26, 27]),
    ('buildings', 'Buildings, insulation and equipment', [12, 13, 14, 15, 17, 18, 19, 20]),
    ('vehicles', 'Vehicles, RVs and gear', [21, 22, 23, 24]),
    ('application', 'Surfaces and application', [47, 49, 50, 51, 52, 29, 30, 37, 38, 39, 40, 41, 53, 54, 48, 35, 55, 56, 36]),
    ('durability', 'Durability and care', [43, 61, 44, 45, 46, 34]),
    ('buying', 'Buying and support', [58, 32, 33, 31, 59, 60]),
]


def clean(s):
    # House style: no em-dashes.
    return s.replace(' — ', ' - ').replace('—', ' - ')


def para(text):
    out = []
    for block in re.split(r'\n\s*\n', clean(text).strip()):
        block = html.escape(block.strip()).replace('\n', '<br>')
        block = re.sub(r'(https?://[^\s<]+[^\s<.,)])', r'<a href="\1">\1</a>', block)
        out.append(f'<p>{block}</p>')
    return '\n'.join(out)


def faq_parts():
    ents = json.loads((ROOT / 'faq_ld.json').read_text())['mainEntity']
    used = sorted(i for _, _, ix in FAQ_GROUPS for i in ix)
    assert used == list(range(len(ents))), 'every FAQ entry must be grouped exactly once'
    toc, groups = [], []
    for gid, title, ix in FAQ_GROUPS:
        toc.append(f'<a href="#{gid}">{title}</a>')
        items = '\n'.join(
            f'<details><summary>{html.escape(clean(ents[i]["name"]))}</summary>'
            f'<div class="details-body">{para(ents[i]["acceptedAnswer"]["text"])}</div></details>'
            for i in ix)
        groups.append(f'<div class="faq-group" id="{gid}">\n<h2>{title}</h2>\n{items}\n</div>')
    ld = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': clean(e['name']),
         'acceptedAnswer': {'@type': 'Answer', 'text': clean(e['acceptedAnswer']['text'])}} for e in ents]}
    return {
        'faq_toc': '\n      '.join(toc),
        'faq_groups': '\n\n'.join(groups),
        'faq_jsonld': '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>',
    }


def build(page):
    src = page.read_text()
    fm, body = re.match(r'---\n(.*?)\n---\n(.*)', src, re.S).groups()
    meta = dict(line.split(': ', 1) for line in fm.splitlines())
    head = HEAD.replace('{{title}}', html.escape(meta['title'])).replace('{{description}}', html.escape(meta['description']))
    # Design preview only: point search engines at the live site.
    live = '' if page.stem == 'index' else page.stem
    head = head.replace('{{canonical}}', f'https://cryox.co/{live}')
    for key in ('how', 'faq', 'about'):
        head = head.replace('{{nav_%s}}' % key, ' aria-current="page"' if meta.get('nav') == key and key != 'how' else '')
    if '{{faq_' in body:
        for k, v in faq_parts().items():
            body = body.replace('{{%s}}' % k, v)
    doc = (head + body + FOOT).replace('{{v}}', VERSION)
    assert '—' not in doc, f'em-dash in {page.name}'
    (OUT / page.name).write_text(doc)
    print('built', page.name)


for p in sorted((ROOT / 'pages').glob('*.html')):
    build(p)
