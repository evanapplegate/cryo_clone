# Engraving-style background sun: radially hatched disk behind a 16-point star, one tone. Writes docs/img/sun.svg.
import math, random

TONE = '#E8E3D9'
C, R_OUT, POINTS = 100, 96, 16
STAR_OUT, STAR_IN = 82, 52
rnd = random.Random(4)

# Tapered hatch strokes: hairline near the star, widening toward a slightly ragged rim.
hatch = []
n = 108
pt = lambda r, a: '%.1f %.1f' % (C + r * math.cos(a), C + r * math.sin(a))
for i in range(n):
    a = 2 * math.pi * i / n + rnd.uniform(-0.012, 0.012)
    r0, r1 = 48, R_OUT - rnd.uniform(0, 4)
    w0, w1 = 0.25 / r0, 1.35 / r1  # half-widths as angles
    hatch.append('M%sL%sL%sL%sZ' % (pt(r0, a - w0), pt(r1, a - w1), pt(r1, a + w1), pt(r0, a + w0)))

star = []
for i in range(POINTS * 2):
    a = -math.pi / 2 + math.pi * i / POINTS
    r = STAR_OUT if i % 2 == 0 else STAR_IN
    star.append('%.1f %.1f' % (C + r * math.cos(a), C + r * math.sin(a)))

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<path d="{''.join(hatch)}" fill="{TONE}"/>
<polygon points="{' '.join(star)}" fill="{TONE}" stroke="{TONE}" stroke-width="4.5" stroke-linejoin="miter"/>
</svg>
'''
open('docs/img/sun.svg', 'w').write(svg)
print(len(svg), 'bytes')
