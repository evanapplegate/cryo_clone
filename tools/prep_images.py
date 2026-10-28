# Recolor/resize source images into docs/img.
from PIL import Image
import shutil

SRC, OUT = 'src_assets/', 'docs/img/'
INK, BG = (0x13, 0x25, 0x3F), (0xF4, 0xF2, 0xEE)

logo = Image.open(SRC + 'logo.png').convert('RGBA')
logo = logo.crop(logo.getbbox())
logo = logo.crop((0, 0, 692, logo.height))  # drop the ".co" box (starts after the gap at x=692)
logo = logo.crop(logo.getbbox())
for name, rgb in (('logo-ink.png', INK), ('logo-light.png', BG)):
    px = [(*rgb, a) for *_, a in logo.getdata()]
    im = Image.new('RGBA', logo.size); im.putdata(px)
    im.save(OUT + name, optimize=True)

shutil.copy(SRC + 'thermal-shade.jpg', OUT + 'thermal-shade.jpg')
Image.open(SRC + 'popsci.webp').save(OUT + 'popsci.webp', quality=88)
Image.open(SRC + 'actionlab.jpg').resize((960, 540), Image.LANCZOS).save(OUT + 'actionlab.jpg', quality=82)
Image.open(SRC + 'industries.png').save(OUT + 'industries.webp', quality=90)
