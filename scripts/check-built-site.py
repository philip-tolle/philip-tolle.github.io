"""Check internal navigation, anchors and asset references in an Astro build.

Usage: python scripts/check-built-site.py <build-directory>
The independently built Prompt Studio and PHP area are not crawled.
"""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = set()
        self.duplicates = []
        self.references = []
        self.redirect = False
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            if attrs['id'] in self.ids:
                self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh':
            self.redirect = True
        if tag == 'a' and attrs.get('href'):
            self.references.append(('link', attrs['href']))
        if tag in ('img', 'script', 'audio', 'source') and attrs.get('src'):
            self.references.append(('asset', attrs['src']))
        if tag == 'link' and attrs.get('rel') in ('stylesheet', 'preload', 'icon') and attrs.get('href'):
            self.references.append(('asset', attrs['href']))
        if tag in ('img', 'source') and attrs.get('srcset'):
            for candidate in attrs['srcset'].split(','):
                self.references.append(('asset', candidate.strip().split(' ')[0]))


root = Path(sys.argv[1]).resolve()
if not root.is_dir():
    raise SystemExit('Build directory does not exist')
files = [f for f in root.rglob('*.html') if 'prompt-studio' not in f.relative_to(root).parts]
errors = []
references = 0
pages = {file: Page(file.read_text(encoding='utf-8')) for file in files}
for file, page in pages.items():
    relative = file.relative_to(root).as_posix()
    url = 'https://www.next-course.de/' + relative.removesuffix('index.html')
    if page.duplicates:
        errors.append(f'{relative}: duplicate IDs {page.duplicates}')
    for kind, target in page.references:
        resolved = urlsplit(urljoin(url, target))
        if resolved.scheme not in ('http', 'https') or resolved.hostname not in ('www.next-course.de', 'next-course.de'):
            continue
        references += 1
        candidate = (root / unquote(resolved.path).lstrip('/')).resolve()
        if not candidate.is_relative_to(root):
            errors.append(f'{relative}: path escapes build: {target}')
            continue
        if candidate.is_dir():
            candidates = [candidate / 'index.html', candidate / 'index.php']
            candidate = next((item for item in candidates if item.is_file()), candidates[0])
        if not candidate.is_file():
            errors.append(f'{relative}: missing {kind}: {target}')
            continue
        if kind == 'link' and '/consulting/' in resolved.path and not page.redirect:
            errors.append(f'{relative}: internal link still uses Consulting: {target}')
        fragment = unquote(resolved.fragment)
        if fragment and candidate in pages and not pages[candidate].redirect and fragment not in pages[candidate].ids:
            errors.append(f'{relative}: missing anchor: {target}')

print(json.dumps({'pages': len(pages), 'internal_references': references, 'errors': errors}, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
