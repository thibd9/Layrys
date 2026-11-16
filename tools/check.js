// syntax check of the combined script and element id check
const fs = require('fs'), vm = require('vm');
const root = require('path').join(__dirname, '..', 'src') + '/';
const files = ['shader.js', 'data.js', 'assets.js', 'engine.js', 'mock3d.js', 'dielines.js', 'pdf.js', 'print.js', 'app.js', 'extras.js', 'mockups.js', 'mock_ui.js', 'gallery.js', 'create.js', 'help.js', 'stack.js', 'studio.js', 'tour.js', 'home.js'];
const js = '(() => {\n"use strict";\n' + files.map(f => fs.readFileSync(root + f, 'utf8')).join('\n') + '\n})();';
try { new vm.Script(js, { filename: 'all.js' }); console.log('syntax ok', js.length); } catch (e) { console.log(e.stack.split('\n').slice(0, 5).join('\n').slice(0, 900)); }
const body = fs.readFileSync(root + 'body.html', 'utf8');
const ids = new Set([...body.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const all = [...body.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]); const dups = all.filter((x, i) => all.indexOf(x) !== i);
const code = files.filter(f => f !== 'assets.js' && f !== 'shader.js').map(f => fs.readFileSync(root + f, 'utf8')).join('\n');
const used = new Set([...code.matchAll(/\$\("#([A-Za-z0-9_-]+)"/g)].map(m => m[1]));
console.log('missing in body:', [...used].filter(u => !ids.has(u)).sort().join(', ') || 'none', '| duplicate ids:', dups.join(', ') || 'none');
