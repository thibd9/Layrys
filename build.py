#!/usr/bin/env python3
"""Assemble src/*.html and src/*.js into page.html (artifact fragment) and index.html (standalone)."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
import re
head = (src / "head.html").read_text()
# the dark tokens are written once and emitted for the system preference and for the explicit choice
m = re.search(r"/\*DARK\{\*/(.*?)/\*\}DARK\*/", head, re.S)
if m:
    d = m.group(1)
    head = head[:m.start()] + '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {' + d + '}\n}\n:root[data-theme="dark"] {' + d + '}' + head[m.end():]
body = (src / "body.html").read_text()
js = "\n".join((src / f).read_text() for f in ["shader.js", "data.js", "assets.js", "engine.js", "mock3d.js", "dielines.js", "pdf.js", "print.js", "app.js", "extras.js", "mockups.js", "mock_ui.js", "gallery.js", "create.js", "help.js", "stack.js", "studio.js", "tour.js"])
script = "<script>\n(() => {\n  \"use strict\";\n" + js + "\n})();\n</script>\n"
page = head + body + script
(root / "page.html").write_text(page)
import urllib.parse
icon = '<link rel="icon" href="data:image/svg+xml,' + urllib.parse.quote((src / 'icon.svg').read_text()) + '">\n'
standalone = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
              + icon + head.split("</style>")[0] + "</style>\n</head>\n<body>\n" + body + script + "</body>\n</html>\n")
(root / "index.html").write_text(standalone)
print("page.html", len(page), "index.html", len(standalone))
