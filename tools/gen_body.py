#!/usr/bin/env python3
"""Generate src/body.html (v12) from a template, reusing the settings blocks of the v11 body."""
import re
import os
SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src") + os.sep
old = open(SRC + "v11/body.html", encoding="utf8").read().split("\n")
def L(a, b): return "\n".join(old[a - 1:b])

ICONS = {
 "atelier": '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M12 8.5l1.1 2.4 2.4 1.1-2.4 1.1L12 15.5l-1.1-2.4L8.5 12l2.4-1.1z"/>',
 "serie": '<rect x="8" y="3" width="12" height="16" rx="2"/><path d="M5 7v12a2 2 0 0 0 2 2h8"/>',
 "scissors": '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 17M8 15.5L20 7"/>',
 "cube": '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
 "undo": '<path d="M8 5L3 10l5 5"/><path d="M3 10h11a6 6 0 0 1 0 12h-3"/>',
 "redo": '<path d="M16 5l5 5-5 5"/><path d="M21 10H10a6 6 0 0 0 0 12h3"/>',
 "help": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8"/><path d="M12 17h.01"/>',
 "download": '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
 "upload": '<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
 "plus": '<path d="M12 5v14M5 12h14"/>', "minus": '<path d="M5 12h14"/>',
 "trash": '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
 "eye": '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
 "eyeoff": '<path d="M4 4l16 16M10 6a9 9 0 0 1 2-.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.5 7.5A17 17 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.5-.7"/>',
 "up": '<path d="M6 14l6-6 6 6"/>', "down": '<path d="M6 10l6 6 6-6"/>', "left": '<path d="M14 6l-6 6 6 6"/>', "right": '<path d="M10 6l6 6-6 6"/>',
 "flip": '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
 "zoomin": '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3M11 8.5v5M8.5 11h5"/>',
 "zoomout": '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3M8.5 11h5"/>',
 "search": '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
 "fit": '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
 "play": '<path d="M8 5.5v13l11-6.5z"/>', "pause": '<path d="M8.5 5.5v13M15.5 5.5v13"/>', "image": '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17.5l5-5 4 4 2.5-2.5 4.5 4.5"/>', "hand": '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
 "compare": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 3v18"/>',
 "proof": '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
 "copy": '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 "edit": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 "close": '<path d="M6 6l12 12M18 6L6 18"/>', "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 "layers": '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5"/>',
 "sliders": '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
 "target": '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/>',
 "swatch": '<path d="M5 4h6v13a3 3 0 0 1-6 0z"/><path d="M11 7.5l4.2-2.4 3 5.2L11 14.5"/><path d="M12.5 17.5H20v-6h-2.2"/><path d="M8 17h.01"/>',
 "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
 "moon": '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
 "auto": '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
 "rotate": '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
 "home": '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
 "camera": '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 "sparkle": '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
 "palette": '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-1.4 1-2 2.2-2H18a3 3 0 0 0 3-3c0-6-4-9-9-9z"/><path d="M7.5 12h.01M9.5 7.5h.01M14.5 7h.01"/>',
 "brush": '<path d="M14 4l6 6-8 8H6v-6z"/><path d="M6 18l-2.5 2.5"/>',
 "wand": '<path d="M5 19L16 8M14 6l4 4"/><path d="M18 3v3M16.5 4.5h3M6 5v2M5 6h2"/>',
 "rect": '<rect x="4" y="6" width="16" height="12" rx="1" stroke-dasharray="3 2.5"/>',
 "shuffle": '<path d="M3 7h3.5c3 0 4.5 2 6 5s3 5 6 5H21M21 17l-3-3M21 17l-3 3M3 17h3.5c1.4 0 2.5-.5 3.4-1.300M21 7h-2.500c-1.400 0-2.500.5-3.400 1.300M21 7l-3-3M21 7l-3 3"/>',
 "card": '<rect x="6" y="3" width="12" height="18" rx="2"/>',
 "fan": '<rect x="9.5" y="4" width="8" height="12" rx="1.5" transform="rotate(16 13.5 18)"/><rect x="8" y="4" width="8" height="12" rx="1.5"/><rect x="6.500" y="4" width="8" height="12" rx="1.5" transform="rotate(-16 10.5 18)"/>',
 "row": '<rect x="2.5" y="6" width="5.5" height="12" rx="1"/><rect x="9.25" y="6" width="5.5" height="12" rx="1"/><rect x="16" y="6" width="5.5" height="12" rx="1"/>',
 "grid": '<rect x="4" y="3" width="4.600" height="5.400" rx=".8"/><rect x="9.700" y="3" width="4.600" height="5.400" rx=".8"/><rect x="15.400" y="3" width="4.600" height="5.400" rx=".8"/><rect x="4" y="9.300" width="4.600" height="5.400" rx=".8"/><rect x="9.700" y="9.300" width="4.600" height="5.400" rx=".8"/><rect x="15.400" y="9.300" width="4.600" height="5.400" rx=".8"/><rect x="4" y="15.600" width="4.600" height="5.400" rx=".8"/><rect x="9.700" y="15.600" width="4.600" height="5.400" rx=".8"/><rect x="15.400" y="15.600" width="4.600" height="5.400" rx=".8"/>',
 "case": '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><rect x="7.500" y="5.500" width="9" height="13" rx="1"/>',
 "slab": '<rect x="5" y="2" width="14" height="20" rx="2"/><rect x="7.500" y="9" width="9" height="11" rx="1"/><path d="M8 5.500h8"/>',
 "block": '<rect x="3" y="4" width="18" height="16" rx="1.5"/><rect x="8.500" y="7" width="7" height="10" rx="1"/><path d="M5.500 6.500h.01M18.500 6.500h.01M5.500 17.500h.01M18.500 17.500h.01" stroke-width="2.200"/>',
 "frame": '<rect x="3" y="3" width="18" height="18" rx="1"/><rect x="6" y="6" width="12" height="12"/><rect x="9" y="8" width="6" height="8" rx="1"/>',
 "booster": '<path d="M7 5h10v14H7z"/><path d="M7 5l1-2h8l1 2M7 19l1 2h8l1-2"/>',
 "mat": '<rect x="2.500" y="6" width="19" height="12" rx="2"/><rect x="6" y="9" width="4" height="6" rx=".8"/><path d="M13 12h5"/>',
 "coin": '<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="5.200"/><path d="M12 9.800v4.400M10.200 12h3.600"/>',
 "boxo": '<path d="M3 9l2-4h14l2 4v10H3z"/><path d="M3 9h18M9 13h6"/>',
 "tin": '<rect x="3" y="7" width="18" height="12" rx="3"/><path d="M3 11h18M9 5h6"/>',
 "book": '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/>',
 "pile": '<path d="M4 16l8 3 8-3M4 13l8 3 8-3"/><path d="M12 5l8 3-8 3-8-3z"/>',
}
def ic(n, small=False):
    return '<svg class="ic%s" aria-hidden="true"><use href="#i-%s"/></svg>' % (" s" if small else "", n)
SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' + "".join('<symbol id="i-%s" viewBox="0 0 24 24">%s</symbol>' % (k, v) for k, v in ICONS.items()) + "</svg>"

tile = '<span class="logo__tile"><svg viewBox="0 0 88 100" aria-hidden="true"><path d="M79.124 10.5768C80.8385 10.5768 82.3303 11.143 83.1102 12.0824C83.593 12.6673 83.7601 13.333 83.6116 14.1294L74.5683 63.641C74.3702 64.7111 73.7451 65.6754 72.8414 66.2789L44.2322 85.5161C40.4255 88.0795 35.9874 89.4482 31.4008 89.4855L9.01241 89.6597H8.94432C7.16786 89.6597 5.70088 89.0936 4.90859 88.1106C4.37627 87.4511 4.20915 86.6298 4.40722 85.6841L15.0722 35.5255C15.295 34.4865 15.8954 33.5906 16.7744 32.9995L43.248 15.1995C47.7418 12.1758 52.9784 10.5768 58.3882 10.5768H79.124ZM79.124 6.22168H58.3882C52.1427 6.22168 46.0334 8.08816 40.8402 11.5785L14.3666 29.3785C12.5591 30.598 11.2902 32.4707 10.8384 34.6109L0.179604 84.7758C-0.903607 89.8651 3.03928 94.0149 8.95051 94.0149C8.98146 94.0149 9.01241 94.0149 9.04955 94.0149L31.438 93.8407C36.854 93.7971 42.1401 92.1608 46.6462 89.1371L75.2554 69.8999C77.1371 68.6369 78.4245 66.6647 78.8331 64.4311L87.8763 14.9195C88.7491 10.1289 84.8124 6.2279 79.124 6.2279V6.22168Z" fill="#fff"/><path d="M68.9789 99.8197C74.884 99.7761 80.4672 95.5641 81.3956 90.481L84.3791 74.1431L45.9282 100L68.9789 99.8197Z" fill="#fff"/><path d="M21.1318 0C15.3815 0 9.84168 3.93206 8.81417 8.74759L5.3479 25.0544L42.6103 0H21.1256H21.1318Z" fill="#fff"/><path d="M39.658 71.0882C39.2433 65.7127 39.8375 61.1336 37.1635 56.9527C34.3162 52.498 29.4387 50.6937 23.9421 49.8165C38.1662 47.3154 43.9475 41.7595 48.7879 28.1155C48.986 33.3354 48.3237 38.3003 50.7996 42.6367C53.4797 47.3278 58.5368 48.7837 64.0642 49.804C50.4096 52.2678 45.0307 58.253 39.6642 71.0882H39.658Z" fill="#fff"/></svg></span>'
word = '<svg class="logo__word" viewBox="68 16 194 28" role="img" aria-label="Layrys" fill="currentColor"><path d="M258.196 28.3295C261.392 30.2502 262.572 33.7537 261.745 37.1718C261.046 40.0528 258.287 43.357 254.602 43.3855L229.863 43.5767L232.092 39.3366C232.647 38.2827 234.061 37.7049 235.332 37.7008L252.53 37.6317C254.076 37.6235 254.939 36.2156 254.89 35.0559C254.832 33.6439 253.784 32.7283 252.196 32.7161L239.555 32.6347C236.537 32.6144 233.638 31.3163 232.026 28.7405C230.414 26.1647 230.632 23.1535 232.042 20.4475C233.165 18.299 236.044 16.1912 239.087 16.1749L261.815 16.0325L260.154 19.5279C259.459 20.9928 258.04 21.9735 256.325 21.9816L240.283 22.063C238.766 22.0711 238.087 23.2756 238.116 24.4557C238.149 25.7375 239.111 26.8565 240.69 26.8687L252.937 26.9541C254.639 26.9663 256.609 27.3651 258.2 28.3255L258.196 28.3295Z"/><path d="M172.624 36.4434L172.53 43.5075L165.53 43.4709V34.417C165.535 31.593 167.862 29.2166 170.765 29.2166H185.981C188.292 29.2166 189.933 28.2115 190.183 26.0711C190.406 24.2033 189.369 22.0467 187.066 22.0385L165.395 21.9368L168.265 17.7171C168.989 16.6672 170.198 15.9999 171.592 16.0162L188.794 16.1952C193.687 16.244 197.084 20.358 197.318 24.887C197.573 29.8269 194.666 33.7578 189.484 34.9012L198.087 43.3936L189.953 43.6215L181.416 35.1332L174.043 35.0925C173.434 35.0925 172.632 35.7313 172.624 36.4434Z"/><path d="M119.165 23.121C118.844 22.6083 118.552 22.3031 118.297 22.238C117.869 22.1281 117.425 22.413 117.117 22.9013L104.06 43.4954L96.391 43.4791L111.022 20.5574C112.676 17.9654 114.612 16.1953 117.557 16.0162C120.715 15.825 123.174 17.3591 124.864 20.0935L139.307 43.4384L131.909 43.5768L119.165 23.121Z"/><path d="M232.046 16.1873L217.596 33.5667L217.588 43.4792L210.568 43.4996L210.436 33.4121L196.537 16.1873L204.646 16.0652L214.273 27.7722L223.925 16.1669L232.046 16.1873Z"/><path d="M165.847 16.2685L151.467 33.6194L151.454 43.5279L144.443 43.5075L144.435 33.5503L130.465 16.1668L138.443 16.0447L148.123 27.7517L157.767 16.1952L165.847 16.2685Z"/><path d="M96.2636 37.6601L92.653 43.5808L75.3609 43.5442C71.2035 43.5319 68 40.1586 68 36.0854L68.0082 21.827C68.0123 18.0386 71.6805 15.65 75.3116 16.2074L75.2993 34.4455C75.2993 36.5289 76.6275 37.6316 78.659 37.6357L96.2595 37.6601H96.2636Z"/></svg>'
mark = '<svg class="brand__mark" viewBox="0 0 53 60" aria-hidden="true" fill="currentColor"><path d="M47.6542 6.34599C48.6868 6.34599 49.5852 6.68569 50.0549 7.24937C50.3457 7.60027 50.4464 7.99969 50.3569 8.47751L44.9104 38.1845C44.7911 38.8265 44.4146 39.4052 43.8703 39.7673L26.6398 51.3096C24.3471 52.8476 21.6742 53.6688 18.9118 53.6912L5.42788 53.7958H5.38687C4.31696 53.7958 3.43344 53.4561 2.95626 52.8662C2.63566 52.4705 2.535 51.9778 2.6543 51.4104L9.07752 21.3152C9.21173 20.6918 9.57334 20.1542 10.1027 19.7996L26.0471 9.11958C28.7535 7.30536 31.9074 6.34599 35.1656 6.34599H47.6542ZM47.6542 3.73291H35.1656C31.4041 3.73291 27.7246 4.8528 24.5969 6.947L8.65254 17.627C7.56398 18.3587 6.79976 19.4823 6.52762 20.7664L0.108121 50.8654C-0.544267 53.9189 1.83042 56.4088 5.3906 56.4088C5.40924 56.4088 5.42788 56.4088 5.45025 56.4088L18.9342 56.3043C22.1961 56.2782 25.3798 55.2964 28.0937 53.4822L45.3242 41.9398C46.4575 41.182 47.2329 39.9987 47.4789 38.6586L52.9255 8.9516C53.4511 6.07721 51.0801 3.73664 47.6542 3.73664V3.73291Z"/><path d="M41.5441 59.8918C45.1005 59.8657 48.4631 57.3384 49.0223 54.2886L50.8192 44.4858L27.6613 60.0001L41.5441 59.8918Z"/><path d="M12.7272 0C9.26392 0 5.92743 2.35924 5.30859 5.24855L3.22095 15.0327L25.6631 0H12.7234H12.7272Z"/><path d="M23.8849 42.653C23.6351 39.4277 23.993 36.6803 22.3825 34.1717C20.6677 31.4989 17.7301 30.4163 14.4197 29.89C22.9865 28.3893 26.4684 25.0558 29.3836 16.8694C29.5029 20.0013 29.104 22.9803 30.5952 25.5821C32.2094 28.3968 35.2551 29.2703 38.5841 29.8825C30.3603 31.3608 27.1207 34.9519 23.8886 42.653H23.8849Z"/></svg>'
add_kind = re.search(r'<select id="addKind".*?</select>', old[200]).group(0).replace('<option value="text">', '<option value="finish">Couche de finition sur l\'image</option><option value="text">')

GLYPHS = [("⤓ ", ic("download", True) + " "), ("⤒ ", ic("upload", True) + " "), ("✦ ", ic("sparkle", True) + " "), ("⛶ ", ic("fit", True) + " "), ("✎ ", ic("brush", True) + " "), ("⚙ ", ""), ("↶ ", ic("undo", True) + " "), ("▭ ", ic("rect", True) + " "), ("⌗ ", ic("scissors", True) + " ")]
def clean(s):
    for a, b in GLYPHS: s = s.replace(a, b)
    s = re.sub(r'<p class="kicker"[^>]*>\s*\d+ / ([^<]*)</p>', r'<h2>\1</h2>', s)
    s = s.replace('class="cols"', 'class="work"').replace('<aside class="col">', '<aside class="col side">')
    return s

help_inner = clean(L(16, 25)).replace(
    "1. Importe ton illustration (ou dépose-la sur la carte). 2. Choisis une finition dans le nuancier. 3. Indique où l'appliquer : partout, bordure, contours, sujet, ou peins la zone dans l'éditeur. 4. Ajoute d'autres cartes dans « Série », décline les raretés. 5. Vérifie le contrôle avant impression, puis exporte le dossier pour l'imprimeur.",
    "1. Importe ton illustration, ou dépose-la sur la carte. 2. Onglet Finitions : choisis un procédé. 3. Onglet Zone : indique où l'appliquer. 4. Ajoute des cartes sous la scène et décline les raretés. 5. Page Maquettes : place tes cartes dans un bloc acrylique, un cadre ou un slab. 6. Page Découpe : vérifie le contrôle avant impression, puis exporte le dossier pour l'imprimeur.")
editor = clean(L(410, 438)).replace('<div><p class="kicker" style="margin:0">Éditeur de zone</p><h2 id="meTitle">—</h2></div>', '<div><h2>Éditeur de zone</h2><p class="note" id="meTitle">—</p></div>').replace('✦ Baguette', ic("wand", True) + ' Baguette').replace(ic("sparkle", True) + ' Baguette', ic("wand", True) + ' Baguette')
plans = clean(L(291, 335))
serie_p1 = clean(L(263, 271)); serie_p2 = clean(L(274, 283))

T = '''<script>(function(){try{var d=document.documentElement,t=localStorage.getItem("layrys-theme")||"light",f=localStorage.getItem("layrys-font")||"";if(t==="dark"||t==="light")d.dataset.theme=t;if(f)d.dataset.font=f;}catch(e){}})();</script>
@@SPRITE@@
<div class="app">
  <aside class="rail">
    <nav class="nav" aria-label="Pages">
      <button type="button" data-page="accueil" aria-pressed="false">[[home]]<span>Accueil</span></button>
      <div class="nav__flow" role="group" aria-label="Les étapes, dans l'ordre">
        <button type="button" data-page="image" aria-pressed="false" title="Étape 1 : choisir et cadrer l'image">[[image]]<span>Illustration</span></button>
        <button type="button" data-page="atelier" aria-pressed="true" title="Étape 2 : effets d'impression et leurs zones">[[atelier]]<span>Finitions</span></button>
        <button type="button" data-page="serie" aria-pressed="false" title="Étape 3 : les cartes de la série">[[serie]]<span>Série</span></button>
        <button type="button" data-page="maquettes" aria-pressed="false" title="Étape 4 : la carte en volume">[[cube]]<span>Maquettes</span></button>
        <button type="button" data-page="plans" aria-pressed="false" title="Étape 5 : fichiers pour l'imprimeur">[[scissors]]<span>Impression</span></button>
      </div>
      <button type="button" data-page="studio" aria-pressed="false" title="Filmer la carte : mouvements, décors, effets, vidéo">[[camera]]<span>Studio</span></button>
      <button type="button" data-page="creation" aria-pressed="false" title="Option : ajouter un cadre, un nom, des textes">[[edit]]<span>Cadre et texte</span></button>
      <button type="button" id="tourBtn" data-tour title="Guide pas à pas : fabrique une carte avec moi">[[book]]<span>Guide</span></button>
    </nav>
    <div class="rail__foot">
      <div class="menu"><button type="button" id="lookBtn" aria-label="Apparence : thème et police" title="Apparence">[[palette]]</button>
        <div class="pop" id="lookPop" hidden>
          <h3>Thème</h3>
          <div class="seg theme-seg" id="themeSeg"><button type="button" data-theme-set="auto">[[auto.s]] Auto</button><button type="button" data-theme-set="light">[[sun.s]] Clair</button><button type="button" data-theme-set="dark">[[moon.s]] Sombre</button></div>
          <h3>Police de l'interface</h3>
          <div class="fontlist" id="fontList"></div>
          <p class="note">Le choix est mémorisé sur cet appareil.</p>
        </div>
      </div>
      <div class="menu"><button type="button" id="helpBtn" aria-label="Aide et références" title="Aide et références">[[help]]</button>
        <div class="pop help-pop" id="helpPop" hidden>
@@HELP@@
        </div>
      </div>
    </div>
  </aside>

  <div class="main">
  <header class="top">
    <button type="button" class="brand" data-go="accueil" aria-label="Layrys, retour à l'accueil" title="Accueil">@@MARK@@@@WORD@@</button>
    <div class="top__title"><h1 id="pageTitle">Atelier</h1><p id="pageSub">Choisis une finition et sa zone. Incline la carte pour examiner le reflet.</p></div>
    <button type="button" class="btn small" id="pageNext" hidden><span id="pageNextT">Étape suivante</span> [[right.s]]</button>
    <div class="top__right">
      <span id="saveState">Enregistré localement</span>
      <div class="menu"><button type="button" class="spec" id="formatBtn" title="Format de la carte"><span class="glyph"></span><span id="formatVal">63 × 88 mm</span></button>
        <div class="pop" id="formatPop" hidden>
@@FORMATPOP@@
        </div>
      </div>
      <div class="menu"><button type="button" class="spec" id="stockBtn" title="Carton, laminage et tranche">Carton <small>0,33 mm</small></button>
        <div class="pop" id="stockPop" hidden>
@@STOCKPOP@@
        </div>
      </div>
      <span class="sep"></span>
      <button type="button" class="btn icon ghost" id="themeBtn" title="Passer en mode sombre" aria-label="Passer en mode sombre">[[moon]]</button>
      <button type="button" class="btn icon ghost" id="undo" title="Annuler (Ctrl Z)" aria-label="Annuler">[[undo]]</button>
      <button type="button" class="btn icon ghost" id="redo" title="Rétablir (Ctrl Y)" aria-label="Rétablir">[[redo]]</button>
      <div class="menu"><button type="button" class="btn primary" id="exportBtn">[[download.s]] Exporter</button>
        <div class="menu__list" id="exportMenu" hidden>
@@EXPORT@@
        </div>
      </div>
    </div>
  </header>

  <!-- ===== Accueil ===== -->
  <section class="page" id="page-accueil" hidden>
    <div class="home">
      <div class="home__head"><h2>Que veux-tu faire ?</h2><p class="note" id="homeState"></p></div>
      <button type="button" class="home__guide" data-tour><span class="guideav">@@MARK@@</span><span class="home__gt"><b>Première carte ? Suis le guide</b><span>Je t'accompagne pas à pas, de l'image au fichier d'impression. Tu manipules, je t'explique.</span></span><em>Lancer le guide [[right.s]]</em></button>
      <div class="home__grid">
        <button type="button" class="home__tile" data-go="image">[[image]]<i>Étape 1</i><b>Choisir l'illustration</b><span>Importe ton image ou prends un exemple, puis cadre-la sur la carte.</span></button>
        <button type="button" class="home__tile" data-go="atelier">[[atelier]]<i>Étape 2</i><b>Appliquer des finitions</b><span>Holo, dorure, vernis, relief : règle les effets et leurs zones.</span></button>
        <button type="button" class="home__tile" data-go="serie">[[serie]]<i>Étape 3</i><b>Ma liste de cartes</b><span>Toutes les cartes de la série, leurs raretés et les tirages.</span></button>
        <button type="button" class="home__tile" data-go="maquettes">[[cube]]<i>Étape 4</i><b>Voir en maquette</b><span>Booster, display, slab, cadre : ta carte en volume.</span></button>
        <button type="button" class="home__tile" data-go="plans">[[scissors]]<i>Étape 5</i><b>Préparer l'impression</b><span>Plans de découpe, contrôle et fichiers pour l'imprimeur.</span></button>
        <button type="button" class="home__tile" data-go="studio">[[camera]]<i>Présentation</i><b>Filmer la carte au Studio</b><span>Mouvements, décors et effets : une vidéo prête à partager.</span></button>
      </div>
      <div class="home__more"><button type="button" class="link-btn" data-go="creation">[[edit.s]] Option : ajouter un cadre, un nom ou des textes</button><button type="button" class="link-btn" data-go="guide">[[book.s]] Comprendre une carte : zones, marges, vocabulaire</button></div>
    </div>
  </section>

  <!-- ===== Illustration ===== -->
  <section class="page" id="page-image" hidden>
    <div class="work">
      <div class="work__main"><div id="imageStageHost"></div></div>
      <aside class="panel insp" id="imgSide" aria-label="Choisir l'illustration">
        <div class="tabpane">
          <div><h2>Choisir l'illustration</h2><p class="note" id="crFormat"></p></div>
          <div class="notice" id="crNoArt" hidden>[[help.s]]<span>Aucune illustration sur cette carte pour l'instant. Importe la tienne ou clique sur un exemple.</span></div>
          <div class="row"><label class="btn" for="file">[[upload.s]] Importer mon image</label><button type="button" class="btn" id="crLib">[[grid.s]] Ouvrir la bibliothèque</button></div>
          <div class="imggrid" id="imgGrid"></div>
          <div class="crstep"><h3>Cadrage</h3>
            <div class="crsub" id="crImg" hidden>
              <div class="slider small"><span>Taille de l'image</span><output id="o-crImgS">100 %</output><input type="range" id="crImgS" min="20" max="300" value="100"></div>
              <div class="kv"><div class="slider small"><span>Décalage horizontal</span><output id="o-crImgX">0 %</output><input type="range" id="crImgX" min="-60" max="60" value="0"></div><div class="slider small"><span>Décalage vertical</span><output id="o-crImgY">0 %</output><input type="range" id="crImgY" min="-60" max="60" value="0"></div></div>
              <div class="row"><button type="button" class="chip" id="crImgAuto" title="Remplit la carte et place le sujet au centre">[[target.s]] Centrer automatiquement</button><button type="button" class="chip" id="crImgCover" title="Remplit la carte et son fond perdu">Remplir la carte</button><button type="button" class="chip" id="crImgContain" title="Montre toute l'image, quitte à laisser des marges">Image entière</button><button type="button" class="chip" data-imgmove aria-pressed="false" title="Glisse l'image sur la carte pour la déplacer, molette pour changer sa taille">[[hand.s]] Déplacer à la souris</button></div>
              <p class="note" id="crImgMoveNote" hidden>Glisse l'image sur la carte pour la déplacer, molette pour l'agrandir ou la réduire. Reclique sur le bouton pour retrouver l'inclinaison de la carte.</p>
              <div class="notice" id="crImgWarn" hidden>[[help.s]]<span>L'image ne couvre plus toute la carte et son fond perdu : le carton restera visible sur un bord.</span></div>
            </div>
          </div>
          <div class="row"><button type="button" class="btn primary" data-go="atelier">Étape suivante : finitions [[right.s]]</button><button type="button" class="link-btn" data-go="creation">Ajouter un cadre ou du texte (option)</button></div>
        </div>
      </aside>
    </div>
  </section>

  <!-- ===== Studio ===== -->
  <section class="page" id="page-studio" hidden>
    <div class="work">
      <div class="work__main">
        <div class="panel studio">
          <div class="stagebar">
            <div class="cardnav"><button type="button" id="stPrev" aria-label="Carte précédente">[[left.s]]</button><span id="stName">Carte</span><button type="button" id="stNext" aria-label="Carte suivante">[[right.s]]</button></div>
            <span class="spacer"></span>
            <div class="seg" id="stFormat" aria-label="Format de la vidéo"><button type="button" data-fmt="1:1" aria-pressed="false" title="Carré, 1080 × 1080">1:1</button><button type="button" data-fmt="4:5" aria-pressed="true" title="Portrait, 1080 × 1350">4:5</button><button type="button" data-fmt="9:16" aria-pressed="false" title="Vertical, 1080 × 1920">9:16</button><button type="button" data-fmt="16:9" aria-pressed="false" title="Paysage, 1920 × 1080">16:9</button></div>
          </div>
          <div class="studio__view" id="stView"><canvas id="stCanvas" aria-label="Aperçu de l'animation"></canvas><div class="notice" id="stNoGl" hidden>[[help.s]]<span>Le Studio a besoin de WebGL, indisponible dans ce navigateur.</span></div></div>
          <div class="studio__bar">
            <button type="button" class="btn icon" id="stPlay" title="Mettre en pause" aria-label="Mettre en pause">[[pause]]</button>
            <input type="range" id="stSeek" min="0" max="1000" value="0" aria-label="Position dans l'animation">
            <output id="stTime">0 / 8 s</output>
            <label class="check"><input type="checkbox" id="stLoop" checked> Boucle</label>
          </div>
        </div>
      </div>
      <aside class="panel insp" id="stSide" aria-label="Réglages du Studio">
        <div class="tabpane">
          <div><h2>Studio</h2><p class="note">Filme ta carte pour la présenter. La finition réagit au mouvement comme sur la vraie carte.</p></div>
          <div class="crstep"><h3>Mouvement</h3>
            <div class="row"><div class="chips" id="stCats" aria-label="Familles de mouvements"></div></div>
            <div class="stgrid" id="stAnims"></div>
            <div class="slider small" id="stCountW" hidden><span>Nombre de cartes</span><output id="o-stCount">5 cartes</output><input type="range" id="stCount" min="2" max="12" step="1" value="5"></div>
            <p class="note" id="stMultiNote" hidden></p>
            <label class="check"><input type="checkbox" id="stSeqOn"> Enchaîner plusieurs mouvements</label>
            <div class="crsub" id="stSeqBox" hidden>
              <div class="chips" id="stSeq" aria-label="Mouvements de l'enchaînement, dans l'ordre"></div>
              <p class="note" id="stSeqHint"></p>
              <div class="row"><button type="button" class="link-btn muted" id="stSeqClear">Vider l'enchaînement</button></div>
            </div>
            <div class="row"><button type="button" class="btn small" id="stRandom">[[shuffle.s]] Surprends-moi</button><label class="check"><input type="checkbox" id="stFlip"> Inverser le sens</label></div>
          </div>
          <div class="crstep"><h3>Caméra</h3>
            <div class="slider small"><span>Durée</span><output id="o-stDur">8 s</output><input type="range" id="stDur" min="3" max="16" step="0.5" value="8"></div>
            <div class="kv"><div class="slider small"><span>Cadrage</span><output id="o-stZoom">100 %</output><input type="range" id="stZoom" min="65" max="150" step="1" value="100"></div><div class="slider small"><span>Hauteur de vue</span><output id="o-stCam">+4°</output><input type="range" id="stCam" min="-12" max="28" step="1" value="4"></div></div>
          </div>
          <div class="crstep"><h3>Décor</h3>
            <div class="chips" id="stBacks"></div>
            <div class="kv" id="stColors" hidden><label class="field">Centre<input type="color" id="stC1" value="#3b1d4a"></label><label class="field">Bords<input type="color" id="stC2" value="#0c0612"></label></div>
            <p class="q" style="margin:4px 0 0">Sol</p>
            <div class="seg" id="stFloor" aria-label="Type de sol"></div>
            <p class="note" id="stFloorNote"></p>
          </div>
          <div class="crstep"><h3>Effets</h3>
            <div class="stfx" id="stFx"></div>
            <div class="slider small"><span>Intensité des effets</span><output id="o-stFxAmt">100 %</output><input type="range" id="stFxAmt" min="40" max="170" step="5" value="100"></div>
          </div>
          <div class="crstep"><h3>Enregistrer</h3>
            <div class="row"><button type="button" class="btn primary" id="stRec">[[camera.s]] Enregistrer la vidéo</button><button type="button" class="btn" id="stShot">[[download.s]] Image PNG</button></div>
            <p class="note" id="stRecNote"></p>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <!-- ===== Création ===== -->
  <section class="page" id="page-creation" hidden>
    <div class="work">
      <div class="work__main"><div id="creationStageHost"></div></div>
      <aside class="panel insp" id="crSide" aria-label="Composer la carte">
        <div class="tabpane">
          <div><h2>Cadre et texte</h2><p class="note">Une option, hors du parcours. Si ton illustration a déjà son cadre et ses textes, tu n'as rien à faire ici. Sinon, ajoute seulement ce qui manque.</p>
            <div class="row"><button type="button" class="btn small" data-go="atelier">Aller aux finitions [[right.s]]</button><button type="button" class="link-btn" data-go="image">[[left.s]] Changer d'illustration</button></div></div>
          <div class="crstep"><h3><i>1</i>Bordure</h3>
            <label class="field">Type de bordure<select id="cr-border"><option value="none">Aucune bordure</option><option value="thin">Simple</option><option value="double">Double filet</option><option value="ornate">Ornée, avec coins</option></select></label>
            <div class="crsub" id="crBorderOpts" hidden>
              <div class="slider small"><span>Épaisseur</span><output id="o-cr-bw">—</output><input type="range" id="cr-bw" min="0.5" max="10" step="0.25" value="3"></div>
              <label class="field">Position<select id="cr-pos"><option value="edge">Au bord de la carte</option><option value="in">À l'intérieur, en retrait du bord</option></select></label>
              <div class="slider small" id="crGapW" hidden><span>Retrait depuis le bord</span><output id="o-cr-gap">—</output><input type="range" id="cr-gap" min="1" max="14" step="0.25" value="4"></div>
              <p class="note" id="crCutNote" hidden>Au bord de la carte, une bordure de moins de 2,5 mm laisse voir le moindre décalage de coupe. Épaissis-la ou place-la en retrait.</p>
              <label class="field">Finition de la bordure<select id="cr-finish"></select></label>
              <p class="note" id="crFinNote" hidden>Le métal ou le film remplace la couleur sur la bordure. Tu pourras affiner la finition dans Finitions, calque « Bordure ».</p>
            </div>
            <label class="field">Couleur de la bordure et du sous-titre<input type="color" id="cr-accent" value="#e8b44a"></label>
          </div>
          <div class="crstep"><h3><i>2</i>Textes</h3>
            <label class="field">Fond derrière les textes<select id="cr-panel"><option value="none">Aucun fond</option><option value="band">Bandeau dégradé en bas de carte</option><option value="boxes">Cartouches : nom en haut, texte en bas</option></select></label>
            <label class="field">Nom du personnage<input type="text" id="cr-name" maxlength="28" placeholder="Ex. Séraphine"></label>
            <label class="field">Type ou sous-titre<input type="text" id="cr-type" maxlength="34" placeholder="Ex. Gardienne céleste"></label>
            <label class="field">Texte d'effet<textarea id="cr-effect" rows="3" maxlength="320" placeholder="Ce que fait la carte en jeu, ou une phrase d'ambiance"></textarea></label>
            <p class="note">Laisse un champ vide pour ne pas l'afficher. Glisse un texte sur la carte pour le placer ; clique dessus puis sur la croix, ou touche Suppr, pour l'enlever.</p>
          </div>
          <div class="crstep"><h3><i>3</i>Collection</h3>
            <div class="kv"><label class="field">Rareté<select id="cr-rarity"><option value="">Non définie</option></select></label><label class="field">Artiste<input type="text" id="cr-artist" maxlength="30" placeholder="Nom de l'illustrateur"></label></div>
            <div class="row"><label class="check"><input type="checkbox" id="cr-showRar"> Imprimer la rareté</label><label class="check"><input type="checkbox" id="cr-showNum"> Imprimer le numéro</label></div>
            <p class="note">Le numéro est repris de la série : place de la carte sur le nombre total.</p>
          </div>
          <div class="crstep"><h3><i>4</i>Sur la carte</h3>
            <div class="crlist" id="crList"></div>
            <p class="note" id="crEmpty" hidden>La carte est vide.</p>
            <div class="row"><button type="button" class="btn small" id="crReplace">[[rotate.s]] Replacer les textes</button><button type="button" class="btn small" id="crClear">[[trash.s]] Tout effacer et recommencer</button></div>
            <p class="note">La corbeille retire un élément. « Tout effacer » retire la bordure et les textes, pas l'illustration. Ctrl + Z annule.</p>
          </div>
          <div class="row"><button type="button" class="btn primary" data-go="atelier">Passer aux finitions [[right.s]]</button><button type="button" class="link-btn" data-go="guide">[[book.s]] Où placer chaque élément ?</button></div>
        </div>
      </aside>
    </div>
  </section>

  <!-- ===== Tutoriel ===== -->
  <section class="page" id="page-guide" hidden>
    <div class="guide">
      <div class="panel"><div class="panel__in">
        <h2>Anatomie d'une carte</h2>
        <p class="note">Une carte à collectionner suit presque toujours le même plan. Voici où va chaque élément et pourquoi.</p>
        <div class="anat">
          <svg viewBox="0 0 252 352" role="img" aria-label="Schéma d'une carte avec ses zones numérotées">
            <rect x="1.500" y="1.500" width="249" height="349" rx="14" class="a-bleed"/><rect x="13.500" y="13.500" width="225" height="325" rx="12" class="a-cut"/><rect x="25.500" y="25.500" width="201" height="301" rx="6" class="a-safe"/>
            <rect x="32" y="32" width="150" height="22" rx="4" class="a-box"/><circle cx="206" cy="43" r="11" class="a-box"/>
            <rect x="32" y="60" width="188" height="138" rx="4" class="a-art"/><path d="M32 170l46-44 34 30 28-22 80 52v12H32z" class="a-hill"/>
            <rect x="32" y="204" width="188" height="16" rx="3" class="a-box"/><rect x="32" y="226" width="188" height="70" rx="4" class="a-box"/>
            <path d="M40 240h150M40 252h172M40 264h130M40 276h160" class="a-line"/><path d="M32 308h70M160 308h60M90 320h72" class="a-line"/>
            <g class="a-num"><circle cx="44" cy="43" r="8"/><text x="44" y="46.500">1</text><circle cx="206" cy="43" r="8"/><text x="206" y="46.500">2</text><circle cx="126" cy="104" r="8"/><text x="126" y="107.500">3</text><circle cx="13.500" cy="130" r="8"/><text x="13.500" y="133.500">4</text><circle cx="44" cy="212" r="8"/><text x="44" y="215.500">5</text><circle cx="126" cy="262" r="8"/><text x="126" y="265.500">6</text><circle cx="212" cy="308" r="8"/><text x="212" y="311.500">7</text><circle cx="168" cy="308" r="8"/><text x="168" y="311.500">8</text><circle cx="44" cy="308" r="8"/><text x="44" y="311.500">9</text><circle cx="126" cy="320" r="8"/><text x="126" y="323.500">10</text></g>
          </svg>
          <ol class="anat__list">
            <li><b>Nom du personnage.</b> En haut, bien lisible : c'est ce qu'on lit en premier.</li>
            <li><b>Coût ou symbole.</b> Dans un coin du haut : coût, élément, niveau, selon ton jeu.</li>
            <li><b>Illustration.</b> Le cœur de la carte. Elle remplit toute la carte (full art) ou la fenêtre du cadre.</li>
            <li><b>Cadre.</b> La bordure qui tient l'ensemble. Sa couleur indique souvent le type ou la faction.</li>
            <li><b>Type ou sous-titre.</b> Une ligne courte sous l'illustration : classe, famille, rôle.</li>
            <li><b>Texte d'effet.</b> Ce que fait la carte. Reste court, 6 pt au minimum pour rester lisible.</li>
            <li><b>Rareté.</b> Un code ou un symbole en bas : C, U, R, SR, UR…</li>
            <li><b>Numéro de collection.</b> La place dans la série, par exemple 012/100.</li>
            <li><b>Artiste.</b> « Illus. » suivi du nom, en petit, en bas à gauche.</li>
            <li><b>Mentions.</b> © et année, tout en bas.</li>
          </ol>
        </div>
        <p class="note"><span class="a-key a-key--bleed"></span> Fond perdu : l'image doit aller jusque-là. <span class="a-key a-key--cut"></span> Coupe : le bord de la carte finie. <span class="a-key a-key--safe"></span> Zone de sécurité : aucun texte en dehors.</p>
      </div></div>
      <div class="panel"><div class="panel__in">
        <h2>Formats et marges</h2>
        <table class="gtable"><thead><tr><th>Format</th><th>Carte finie</th><th>Fichier à préparer</th><th>En pixels, 300 dpi</th></tr></thead>
          <tbody><tr><td>Standard (la plupart des jeux)</td><td>63 × 88 mm</td><td>69 × 94 mm</td><td>815 × 1110 px</td></tr><tr><td>Japonais, plus étroit</td><td>59 × 86 mm</td><td>65 × 92 mm</td><td>768 × 1087 px</td></tr></tbody></table>
        <ul class="gtips"><li>Ajoute 3 mm de fond perdu de chaque côté : la coupe n'est jamais parfaite au dixième près.</li><li>Garde les textes et logos à 3 mm au moins du bord : c'est la zone de sécurité.</li><li>Travaille à 300 dpi. En dessous, l'image sera floue une fois imprimée.</li><li>Le format se choisit en haut de l'écran ; les plans exacts sont dans Impression.</li></ul>
      </div></div>
      <div class="panel"><div class="panel__in">
        <h2>Les étapes</h2>
        <ol class="gsteps">
          <li><b>Choisis ton illustration</b> au bon format, fond perdu compris, et cadre-la. <button type="button" class="link-btn" data-go="image">Ouvrir Illustration [[right.s]]</button></li>
          <li><b>En option, ajoute un cadre et des textes</b> si ton illustration n'en a pas déjà. <button type="button" class="link-btn" data-go="creation">Ouvrir Cadre et texte [[right.s]]</button></li>
          <li><b>Ajoute les finitions</b> : holo, dorure, vernis, relief, et la zone de chacune. <button type="button" class="link-btn" data-go="atelier">Ouvrir Finitions [[right.s]]</button></li>
          <li><b>Décline la série</b> : autres cartes, raretés, composition des boosters. <button type="button" class="link-btn" data-go="serie">Ouvrir Série [[right.s]]</button></li>
          <li><b>Vérifie en volume</b> : booster, display, slab, cadre. <button type="button" class="link-btn" data-go="maquettes">Ouvrir Maquettes [[right.s]]</button></li>
          <li><b>Exporte pour l'imprimeur</b> : plans, contrôle, PDF. <button type="button" class="link-btn" data-go="plans">Ouvrir Impression [[right.s]]</button></li>
        </ol>
      </div></div>
      <div class="panel"><div class="panel__in">
        <h2>Bien placer les effets</h2>
        <ul class="gtips"><li>Le holo va sur l'illustration ou le fond, pas sur les textes : il les rend difficiles à lire.</li><li>La dorure sert aux petits éléments : nom, cadre, contours. Sur de grandes surfaces, elle coûte cher et marque.</li><li>Le vernis sélectif fait ressortir le sujet sur un fond mat.</li><li>Le relief suit le dessin : utilise « Détecter » puis corrige la zone si besoin.</li><li>Plus une carte est rare, plus elle cumule de finitions. Garde les communes simples.</li></ul>
      </div></div>
    </div>
  </section>

  <!-- ===== Atelier ===== -->
  <section class="page" id="page-atelier">
    <div class="work">
      <div class="work__main">
        <div id="atelierStageHost">
          <div class="panel" id="stagePanel">
            <div class="stagebar">
              <div class="seg"><button type="button" data-face="front" aria-pressed="true">Recto</button><button type="button" data-face="back" aria-pressed="false">Verso</button></div>
              <div class="cardnav" id="cardNav"><button type="button" id="cardPrev" aria-label="Carte précédente">[[left.s]]</button><button type="button" id="cardNavName" title="Ouvrir la série">Carte 1</button><button type="button" id="cardNext" aria-label="Carte suivante">[[right.s]]</button></div>
              <span class="spacer"></span>
              <div class="seg" id="viewsRow" aria-label="Vue">
                <button type="button" data-view="0" aria-pressed="true">Rendu</button>
                <button type="button" data-view="1" aria-pressed="false">Image</button>
                <button type="button" data-view="9" aria-pressed="false">Masque</button>
                <button type="button" data-view="4" aria-pressed="false">Relief</button>
                <button type="button" data-view="7" aria-pressed="false">Sujet</button>
              </div>
              <button type="button" class="btn small" id="cmpBtn" aria-pressed="false" title="Comparer avant et après (C)">[[compare.s]] Comparer</button><select id="cmpWith" hidden aria-label="Comparer avec" style="width:auto"></select>
              <button type="button" class="btn small" id="proofBtn" aria-pressed="false" title="Simuler les couleurs imprimées (P)">[[proof.s]] Épreuve</button>
              <button type="button" class="btn small" id="shimBtn" title="Incliner la carte un instant pour voir réagir la finition (M)">[[sparkle.s]] Miroiter</button>
            </div>
            <div class="notice" id="strayNote" role="status" hidden>[[help.s]]<span id="strayText"></span><span class="notice__acts"><button type="button" class="btn small accent" id="strayFix">Retirer ce calque</button><button type="button" class="btn small ghost" id="strayKeep">Le garder</button></span></div>
            <div class="stage" id="bench">
              <div class="stage__tag" id="fxTag"><i></i><span id="fxname"></span></div>
              <div class="stage__zoom"><button type="button" id="panMode" title="Déplacer la vue (ou maintenir Espace)" aria-label="Déplacer la vue" aria-pressed="false">[[hand.s]]</button><button type="button" id="zoomOut" title="Zoom arrière" aria-label="Zoom arrière">[[minus.s]]</button><output id="zoomOutp">100 %</output><button type="button" id="zoomIn" title="Zoom avant" aria-label="Zoom avant">[[plus.s]]</button><button type="button" id="zoomFit" title="Ajuster à la scène" aria-label="Ajuster">[[fit.s]]</button></div>
              <div class="stagewrap" id="stagewrap">
                <div class="tilt" id="tiltRoot"><div class="tilt__in" id="tiltIn">
                  <div class="protect" id="protect" data-mode="none">
@@CARD@@
                  </div>
                </div></div>
              </div>
              <div class="brush-cursor" id="brushCursor"></div>
              <span class="stage__info" id="dims"></span>
              <span class="stage__hint" id="hint">Glisser pour incliner · Molette pour zoomer</span>
            </div>
            <div class="maskbar" id="maskBar" hidden>
              <span class="maskbar__t" id="maskBarT">Masque</span>
              <div class="slider small" id="mbThrW" title="Déplace la limite : plus ou moins de surface dans la zone"><span>Seuil</span><output id="o-mbThr">—</output><input type="range" id="mbThr" min="10" max="90" value="50"></div>
              <div class="slider small" id="mbSoftW" title="Bord net ou fondu"><span>Bord</span><output id="o-mbSoft">—</output><input type="range" id="mbSoft" min="1" max="50" value="15"></div>
              <div class="slider small" id="mbGrowW" title="Élargit ou resserre la zone autour du sujet"><span>Étendre / réduire</span><output id="o-mbGrow">—</output><input type="range" id="mbGrow" min="-100" max="100" value="0"></div>
              <button type="button" class="btn small" id="mbInvert" aria-pressed="false">Inverser</button>
              <button type="button" class="btn small primary" id="mbEdit">[[brush.s]] <span id="mbEditT">Retoucher la zone</span></button>
              <button type="button" class="link-btn muted" id="mbReset" hidden>Détection automatique</button>
              <button type="button" class="link-btn" id="mbZone">Changer de zone</button>
            </div>
            <div class="lightbar" id="lightBar">
              <label class="field">Lumière<select id="lightSel" aria-label="Type de lumière"></select></label>
              <div class="slider small" title="Taille et douceur du reflet de la lampe"><span>Diffusion du spot</span><output id="o-mlS">douce</output><input type="range" id="mlS" min="0" max="100" value="20"></div>
              <div class="slider small"><span>Intensité</span><output id="o-mlP">100 %</output><input type="range" id="mlP" min="30" max="180" value="100"></div>
              <div class="slider small" title="Basse : lumière rasante qui creuse les reliefs. Haute : lumière large et uniforme"><span>Hauteur</span><output id="o-mlZ">moyenne</output><input type="range" id="mlZ" min="25" max="300" value="100"></div>
              <div class="slider small"><span>Température</span><output id="o-mlW">neutre</output><input type="range" id="mlW" min="-100" max="100" value="0"></div>
              <button type="button" class="link-btn muted" id="mlReset">Réinitialiser</button>
            </div>
            <div class="lightpanel" id="lightPanel" hidden>
              <div class="slider small"><span>Position horizontale</span><output id="o-mlX">30 %</output><input type="range" id="mlX" min="-40" max="140" value="30"></div>
              <div class="slider small"><span>Position verticale</span><output id="o-mlY">22 %</output><input type="range" id="mlY" min="-40" max="140" value="22"></div>
              <p class="note">Tu peux aussi glisser le point lumineux directement sur la carte.</p>
            </div>
            <div class="lights" id="lightMenu" role="group" aria-label="Lumière" hidden></div>
            <div class="stagebar">
              <div class="angle"><button type="button" id="angPrev" aria-label="Angle précédent">[[left.s]]</button><span id="angName">De face</span><button type="button" id="angNext" aria-label="Angle suivant">[[right.s]]</button></div>
              <button type="button" class="link-btn" id="flipBtn" title="Retourner la carte (F)">[[flip.s]] Retourner</button>
              <label class="check" id="marksLbl"><input type="checkbox" id="marks"> Repères d'impression</label>
              <span class="spacer"></span>
              <span class="note" id="lightName"></span>
            </div>
          </div>
        </div>

        <div class="panel dock" id="atelierDock">
          <div class="dock__bar"><div class="seg" id="dockTabs"><button type="button" data-dock="lib" aria-pressed="true">Illustrations</button><button type="button" data-dock="cards" aria-pressed="false">Cartes de la série</button></div><span class="spacer"></span><button type="button" class="btn icon ghost small" id="dockToggle" aria-expanded="true" aria-label="Replier le tiroir" title="Replier le tiroir">[[down.s]]</button></div>
          <div class="dock__body" data-dockpane="lib">
        <div class="panel" id="libPanel">
          <div class="panel__bar"><h2>Illustrations <span class="note" id="libCount"></span></h2><div class="row"><button type="button" class="link-btn" id="fitBtn">[[fit.s]] Recadrer</button><button type="button" class="link-btn" id="sample">[[sparkle.s]] Exemple</button><button type="button" class="btn small" id="libOpen">[[grid.s]] Ouvrir la bibliothèque</button><label class="btn small accent" for="file">[[upload.s]] Importer<input type="file" id="file" accept="image/*" multiple></label></div></div>
          <div class="lib__strip" id="libStrip"></div>
@@FITROW@@
        </div>
          </div>
          <div class="dock__body" data-dockpane="cards" hidden>
          <div class="panel" id="cardsPanel">
            <div class="panel__bar"><h2>Cartes de la série <span class="note" id="cardsCount"></span></h2><div class="row"><button type="button" class="link-btn" id="cardsNew">[[plus.s]] Nouvelle</button><label class="link-btn" for="cardsFiles">[[upload.s]] Une par image<input type="file" id="cardsFiles" accept="image/*" multiple></label><button type="button" class="link-btn" id="cardsRarity" title="Créer cinq variantes de la carte active, de la commune à la secrète">[[sparkle.s]] Raretés</button></div></div>
            <div class="cardlist" id="cardList"></div>
            <div class="panel__foot"><span class="note">Clic : ouvrir la carte. La pastille indique si elle est prête pour l'impression.</span><button type="button" class="link-btn" id="cardsAll">Planche contact [[right.s]]</button></div>
          </div>
          </div>
        </div>
      </div>


      <aside class="panel insp" id="insp" aria-label="Réglages du calque">
        <div class="insp__head">
          <div class="stack" id="stack">
            <div class="stack__bar"><h3>[[layers.s]] Calques <span class="note" id="stackDoc"></span></h3><div class="row"><button type="button" class="btn small" id="stackAdd" title="Ajoute une finition avec sa propre zone, sur la même illustration">[[plus.s]] Ajouter un masque</button><button type="button" class="link-btn" id="stackAll" title="Ordre, textes, cadres, position de chaque calque">Gérer</button></div></div>
            <div class="stack__list" id="stackList" role="listbox" aria-label="Calques de la carte"></div>
          </div>
          <div class="menu" style="justify-self:start" hidden><button type="button" class="link-btn" id="layerBtn" title="Changer de calque" style="margin:-4px 0 -2px -6px;color:var(--muted)">[[layers.s]] <span id="layerBtnName">Illustration</span> [[down.s]]</button><div class="menu__list left" id="layerMenu" hidden></div></div>
          <div class="fx-title"><div><h2 id="fxTitle">—</h2><p class="fx-sub"><span class="proc-dot" id="fxDot"></span><span id="fxSub"></span><button type="button" class="link" id="noteBtn">Fiche procédé</button></p></div><button type="button" class="btn icon ghost" id="layerDel" title="Retirer ce calque" aria-label="Retirer ce calque">[[trash]]</button></div>
          <p class="note" id="fxNote" hidden></p>
          <div class="slider"><span>Intensité du rendu</span><output id="o-foil">—</output><input type="range" id="foil" min="0" max="150" value="80"></div>
        </div>
        <div class="tabs" role="tablist" id="inspTabs">
          <button type="button" role="tab" data-tab="fx" aria-selected="true">[[swatch]]<span>Finitions</span></button>
          <button type="button" role="tab" data-tab="zone" aria-selected="false">[[target]]<span>Zone</span></button>
          <button type="button" role="tab" data-tab="set" aria-selected="false">[[sliders]]<span>Réglages</span></button>
          <button type="button" role="tab" data-tab="layers" aria-selected="false">[[layers]]<span>Calques · <span id="layerCount">0</span></span></button>
          <button type="button" role="tab" data-tab="sheet" aria-selected="false">[[proof]]<span>Fiche</span></button>
        </div>
        <div class="tabpane" data-pane="fx" role="tabpanel">
          <div class="fx-search">[[search.s]]<input type="search" id="fxSearch" placeholder="Chercher : or, mosaïque, UV, lin…" aria-label="Chercher une finition"></div>
          <p class="fx-hint">Survole une finition pour la voir sur la carte, clique pour l'appliquer.</p>
          <div class="pills" id="catTabs"></div>
          <div class="fxgrid" id="effects"></div>
          <button type="button" class="link-btn" id="seeAll" hidden></button>
        </div>
        <div class="tabpane" data-pane="zone" role="tabpanel" hidden>
          <p class="q" style="margin:0">Où appliquer la finition ?</p>
@@ZONES@@
@@ZONETOOLS@@
          <div class="zonectl" id="growRow" hidden>
            <div class="slider small"><span>Étendre ou réduire la zone</span><output id="o-maskGrow">0%</output><input type="range" id="maskGrow" min="-100" max="100" value="0"></div>
            <div class="row"><button type="button" class="btn small" id="subjEdit">[[brush.s]] Corriger le sujet détecté</button><button type="button" class="link-btn muted" id="subjReset" hidden>Revenir à la détection automatique</button></div>
            <p class="note">Le sujet est détecté une fois pour l'illustration. Corrige-le par formes ou au pinceau : toutes les finitions posées sur « Sujet » ou « Fond » suivent.</p>
          </div>
          <button type="button" class="btn" id="zoneEdit">[[brush.s]] Retoucher cette zone à la main</button>
          <p class="note">La zone devient le masque noir et blanc envoyé à l'imprimeur pour ce procédé. Vérifie-la avec la vue Masque.</p>
        </div>
        <div class="tabpane" data-pane="set" role="tabpanel" hidden>
          <h3>Relief et texture</h3>
          <div class="reliefzone">
            <label class="field">Zone du relief<select id="reliefZone"><option value="0">Toute la finition</option><option value="1">Sujet détecté</option><option value="2">Contours détectés</option><option value="3">Zone peinte</option></select></label>
            <button type="button" class="btn small" id="reliefDetect" title="Détecte le sujet, puis ouvre l'éditeur pour corriger">[[wand.s]] Détecter</button>
            <button type="button" class="btn small" id="reliefPaint" title="Peindre la zone au pinceau ou par formes">[[brush.s]] Peindre</button>
          </div>
          <p class="note">Le relief ne s'applique que dans cette zone. « Détecter » repère le sujet et t'ouvre l'éditeur pour ajuster, au pinceau ou par formes.</p>
@@ADV1@@
          <h3>Motif et matière</h3>
@@ADV2@@
          <h3>Lumière et rendu</h3>
@@ADV3@@
          <details class="disc" id="accentPanel" open><summary>Second procédé superposé</summary><div class="inner">
@@ACCENT@@
          </div></details>
        </div>
        <div class="tabpane" data-pane="layers" role="tabpanel" id="layersPanel" hidden>
          <div class="row" style="justify-content:space-between"><h3>Composition <span class="note" id="layersDoc"></span></h3>@@ADDKIND@@</div>
@@LAYERS@@
        </div>
        <div class="tabpane" data-pane="sheet" role="tabpanel" hidden>
          <div class="row" style="justify-content:space-between"><h3>Fiche de la carte</h3><span class="badge" id="sheetBadge">—</span></div>
          <div class="kv"><label class="field">Nom<input type="text" id="sheetName" maxlength="40"></label><label class="field">Rareté<select id="sheetRarity"><option value="">Non définie</option><optgroup label="Générique"><option>Commune</option><option>Peu commune</option><option>Rare</option><option>Super rare</option><option>Ultra rare</option><option>Secrète</option><option>Hyper rare</option><option>Promo</option></optgroup><optgroup label="Pokémon"><option>Double rare</option><option>Illustration rare</option><option>Illustration spéciale rare</option><option>ACE SPEC</option></optgroup><optgroup label="Yu-Gi-Oh!"><option>Ultimate rare</option><option>Ghost rare</option><option>Starlight rare</option><option>Collector's rare</option><option>Quarter Century Secret</option></optgroup><optgroup label="One Piece"><option>Leader</option><option>Special (SP)</option><option>Treasure rare (TR)</option><option>Manga rare</option></optgroup><optgroup label="Lorcana"><option>Légendaire</option><option>Enchantée</option><option>Épique</option><option>Iconique</option></optgroup><optgroup label="Magic"><option>Mythique</option></optgroup></select></label></div>
          <label class="field">Notes pour l'imprimeur<textarea id="sheetNotes" rows="2" maxlength="400" placeholder="Ex. dorure or mat sur le nom, vernis 3D sur le sujet"></textarea></label>
          <div><p class="q" style="margin:0 0 6px">Procédés utilisés</p><div class="procs" id="sheetProcs"></div></div>
          <div><p class="q" style="margin:0 0 6px">Passes de fabrication</p><ol class="passes" id="sheetPasses"></ol></div>
          <div><p class="q" style="margin:0 0 6px">Contrôle avant impression</p><div class="pre" id="sheetPre"></div></div>
          <div class="row"><button type="button" class="btn small" id="sheetToPlans">[[scissors.s]] Plans et contrôle complet</button><button type="button" class="btn small" id="sheetPdf">[[download.s]] PDF prêt à imprimer</button></div>
        </div>
      </aside>
    </div>
  </section>

  <!-- ===== Série ===== -->
  <section class="page" id="page-serie" hidden>
    <div class="work">
      <div class="work__main">
        <div class="panel">
          <div class="panel__bar"><h2>Planche contact <span class="note" id="serieCount"></span></h2><div class="row"><button type="button" class="link-btn" id="serieNew">[[plus.s]] Nouvelle carte</button><label class="btn small" for="serieFiles">[[upload.s]] Une carte par image<input type="file" id="serieFiles" accept="image/*" multiple></label></div></div>
          <div class="contact" id="contact"></div>
          <div class="panel__foot"><span class="note">Clic : sélectionner. Double-clic : ouvrir dans l'atelier. Pastille verte : prête à imprimer, orange : points à vérifier.</span></div>
        </div>
      </div>
      <aside class="col side">
        <div class="panel"><div class="panel__in">
@@SERIE1@@
        </div></div>
        <div class="panel"><div class="panel__in">
@@SERIE2@@
        </div></div>
        <div class="panel"><div class="panel__in">
          <div class="row" style="justify-content:space-between"><h2>Boosters et tirages</h2><button type="button" class="link-btn" id="csvBtn">[[download.s]] Liste des cartes (CSV)</button></div>
          <p class="note">Indique combien de cartes de chaque rareté contient un booster en moyenne : 1 pour une par booster, 0,33 pour une fois sur trois. La fréquence de sortie et les quantités à imprimer en découlent.</p>
          <div class="kv"><label class="field">Cartes par booster<input type="number" id="pullCards" min="1" max="60"></label><label class="field">Tirage, en displays<input type="number" id="pullDisplays" min="1" max="100000"></label></div>
          <div class="pull" id="pullTable"></div>
          <p class="note" id="pullSum" role="status"></p>
        </div></div>
      </aside>
    </div>
  </section>

  <!-- ===== Plans de découpe ===== -->
  <section class="page" id="page-plans" hidden>
@@PLANS@@
  </section>

  <!-- ===== Maquettes ===== -->
  <section class="page" id="page-maquettes" hidden>
    <div class="work">
      <div class="work__main">
        <div class="panel" id="mkStagePanel">
          <div class="stagebar">
            <h2 id="mkTitle">Maquette</h2>
            <span class="spacer"></span>
            <div class="seg" id="mkViews" aria-label="Angle de vue"><button type="button" data-mv="three">3/4</button><button type="button" data-mv="front">Face</button><button type="button" data-mv="side">Profil</button><button type="button" data-mv="top">Dessus</button><button type="button" data-mv="under">Dessous</button><button type="button" data-mv="back">Dos</button></div>
            <select id="mkMotion" class="mini" aria-label="Animation de la maquette" title="Animation de la maquette"><option value="">Sans animation</option><option value="spin">Rotation</option><option value="sway">Balancement</option><option value="float">Flottement</option></select>
            <button type="button" class="btn small" id="mkShot" title="Enregistrer l'image de la maquette">[[camera.s]] Image PNG</button>
          </div>
          <div class="prodbar"><div class="seg" id="mkCats" aria-label="Famille de produits"></div><div class="prodstrip" id="mkProducts" aria-label="Produits"></div></div>
          <div class="mock__stage" id="mkStage">
            <canvas id="mkCanvas" aria-label="Maquette en volume, manipulable"></canvas>
            <div class="mock__cap" id="mkCaption"></div>
            <div class="stage__zoom"><button type="button" id="mkZoomOut" title="Zoom arrière" aria-label="Zoom arrière">[[minus.s]]</button><button type="button" id="mkZoomIn" title="Zoom avant" aria-label="Zoom avant">[[plus.s]]</button><button type="button" id="mkReset" title="Recentrer la vue" aria-label="Recentrer la vue">[[home.s]]</button></div>
            <span class="mock__hint">Glisser : tourner, même par-dessous · Molette : zoomer · Maj + glisser ou clic droit : déplacer · Double-clic : recentrer</span>
          </div>
          <div class="lights" id="mkLights" role="group" aria-label="Lumière"></div>
        </div>
      </div>
      <aside class="panel insp" id="mkSide" aria-label="Réglages de la maquette">
        <div class="tabs" role="tablist" id="mkTabs">
          <button type="button" role="tab" data-mktab="opt" aria-selected="true">[[sliders]]<span>Options</span></button>
          <button type="button" role="tab" data-mktab="label" aria-selected="false" hidden>[[proof]]<span>Étiquette</span></button>
          <button type="button" role="tab" data-mktab="art" aria-selected="false">[[upload]]<span>Visuels</span></button>
          <button type="button" role="tab" data-mktab="cards" aria-selected="false">[[serie]]<span>Cartes<span id="mkTabCount"></span></span></button>
          <button type="button" role="tab" data-mktab="light" aria-selected="false">[[sun]]<span>Lumière</span></button>
        </div>
        <div class="tabpane" data-mkpane="opt" role="tabpanel">
          <div id="mkFields" style="display:grid;gap:10px"></div>
          <input type="file" id="mkLabelFile" accept="image/*">
          <label class="field">Décor<select id="mkFloor"><option value="studio">Studio, selon le thème</option><option value="light">Studio clair</option><option value="dark">Studio sombre</option><option value="wood">Table en bois</option><option value="felt">Tapis de jeu</option><option value="slate">Ardoise</option></select></label>
          <button type="button" class="btn" id="toPlans">[[scissors.s]] Ouvrir les plans de découpe</button>
        </div>
        <div class="tabpane" data-mkpane="label" role="tabpanel" hidden>
          <div id="mkLabel" style="display:grid;gap:10px"></div>
        </div>
        <div class="tabpane" data-mkpane="art" role="tabpanel" hidden>
          <div id="mkArt" style="display:grid;gap:10px"></div>
        </div>
        <div class="tabpane" data-mkpane="cards" role="tabpanel" id="mkCardsPanel" hidden>
          <div class="panel__bar"><h2>Cartes dans la maquette <span class="note" id="mkSlotsNote"></span></h2>
            <div class="row"><span class="stepper" id="mkCountWrap"><button type="button" id="mkLess" aria-label="Une carte de moins">[[minus.s]]</button><output id="mkCount">5</output><button type="button" id="mkMore" aria-label="Une carte de plus">[[plus.s]]</button></span><button type="button" class="link-btn" id="mkDiff" title="Une carte différente à chaque emplacement">[[grid.s]] Toutes différentes</button><button type="button" class="link-btn" id="mkSame" title="La carte active partout">[[copy.s]] Même carte</button><button type="button" class="link-btn" id="mkShuffle">[[rotate.s]] Mélanger</button></div>
          </div>
          <div class="slots" id="mkSlots"></div>
          <div class="panel__bar" style="padding-top:0;min-height:0"><p class="q" style="margin:0" id="mkPickTitle">Choisir la carte de l'emplacement 1</p></div>
          <div class="picker" id="mkPicker"></div>
        </div>
        <div class="tabpane" data-mkpane="light" role="tabpanel" hidden>
          <div class="row" style="justify-content:space-between"><h2>Éclairage</h2><button type="button" class="link-btn muted" id="mkLightReset">Réinitialiser</button></div>
          <p class="note">Choisis une ambiance sous la maquette, puis déplace la lumière principale. Les ombres et les reflets des cartes suivent.</p>
          <div class="kv">
            <div class="slider small"><span>Direction</span><output id="o-mkAz">0°</output><input type="range" id="mkAz" min="-180" max="180" value="-35"></div>
            <div class="slider small"><span>Hauteur</span><output id="o-mkEl">50°</output><input type="range" id="mkEl" min="12" max="88" value="52"></div>
            <div class="slider small"><span>Intensité</span><output id="o-mkPower">100 %</output><input type="range" id="mkPower" min="40" max="170" value="100"></div>
            <div class="slider small"><span>Ombres portées</span><output id="o-mkShadow">100 %</output><input type="range" id="mkShadow" min="0" max="160" value="100"></div>
            <div class="slider small"><span>Reflet au sol</span><output id="o-mkMirror">100 %</output><input type="range" id="mkMirror" min="0" max="250" value="100"></div>
          </div>
        </div>
      </aside>
    </div>
  </section>
  </div>
</div>
@@EDITOR@@
<div class="editor gallery" id="gallery" hidden role="dialog" aria-modal="true" aria-label="Bibliothèque d'illustrations">
  <div class="editor__bar">
    <div><h2>Bibliothèque d'illustrations</h2><p class="note">Clique sur une image pour l'utiliser sur la carte active. Le bouton + l'ajoute comme calque, la corbeille la retire.</p></div>
    <div class="row"><div class="fx-search" style="width:min(260px,60vw)">[[search.s]]<input type="search" id="galSearch" placeholder="Chercher une image" aria-label="Chercher une image"></div><label class="btn accent" for="file">[[upload.s]] Importer des images</label><button type="button" class="btn" id="galClose">[[close.s]] Fermer</button></div>
  </div>
  <div class="gallery__body" id="galBody">
    <section><h3>Mes images <span class="note" id="galMineCount"></span></h3><div class="gallery__grid" id="galMine"></div></section>
    <section><div class="row" style="justify-content:space-between"><h3>Exemples fournis</h3><button type="button" class="link-btn" id="galRestore" hidden>Réafficher les exemples masqués</button></div><div class="gallery__grid" id="galLib"></div></section>
  </div>
</div>
<div class="capture" id="captureBox" hidden><div class="capture__box"><img id="captureImg" alt="Capture du rendu"><p class="note">Clic droit ou appui long sur l'image pour l'enregistrer.</p><button type="button" class="btn" id="captureClose">Fermer</button></div></div>
<div class="toast" id="toast" role="status" hidden></div>
'''
rep = {
 "@@SPRITE@@": SPRITE, "@@WORD@@": word, "@@MARK@@": mark, "@@HELP@@": help_inner, "@@FORMATPOP@@": L(62, 66), "@@STOCKPOP@@": L(50, 57), "@@EXPORT@@": L(30, 39),
 "@@CARD@@": L(370, 378), "@@FITROW@@": L(80, 88), "@@ZONES@@": clean(L(105, 120)), "@@ZONETOOLS@@": clean(L(121, 142)),
 "@@ADV1@@": L(144, 163), "@@ADV2@@": L(164, 173), "@@ADV3@@": L(174, 178), "@@ACCENT@@": L(185, 197), "@@ADDKIND@@": add_kind, "@@LAYERS@@": L(202, 245),
 "@@SERIE1@@": serie_p1, "@@SERIE2@@": serie_p2, "@@PLANS@@": plans, "@@EDITOR@@": editor,
}
out = T
for k, v in rep.items():
    assert k in out, k
    out = out.replace(k, v)
out = re.sub(r"\[\[([a-z]+)(\.s)?\]\]", lambda m: ic(m.group(1), bool(m.group(2))), out)
for m in re.findall(r'href="#i-([a-z]+)"', out): assert m in ICONS, m
assert "@@" not in out, re.findall(r"@@\w+@@", out)
left = [g for g in "⤓⤒✦⛶✎⚙↶▭⌗🗑↷☼▣◐◧▤✋⟳🖼⌄" if g in out]
print("glyphs left:", left)
for a_, b_ in [
    ('<div class="chips" id="meTools"><button type="button" class="chip" data-tool="brush" aria-pressed="true">', '<div class="chips" id="meTools"><button type="button" class="chip" data-tool="shape" aria-pressed="true" title="Clique ou glisse sur l\'image : chaque région délimitée par les contours est ajoutée d\'un coup">' + ic("target", True) + ' Formes</button><button type="button" class="chip" data-tool="brush" aria-pressed="false">'),
    ('<span>Tolérance de la baguette</span>', '<span>Tolérance (formes et baguette)</span>'),
    (' Éditeur de zone</button>', ' Sélectionner des formes</button>'),
    ("<kbd>M</kbd> repères d'impression", "<kbd>M</kbd> faire miroiter la carte"),
]:
    assert out.count(a_) == 1, a_[:60]; out = out.replace(a_, b_)
for _a, _b in [("ouvrir dans l'atelier", "ouvrir dans Finitions"), ("Ouvrir dans l'atelier", "Ouvrir dans Finitions"), ("modifiable dans l'atelier", "modifiable dans Finitions"), ("dans l'atelier", "dans Finitions")]: out = out.replace(_a, _b)
open(SRC + "body.html", "w", encoding="utf8").write(out)
print(len(out))
