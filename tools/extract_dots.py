# Extract customer dot centroids from the old raster map (gradient Hough on red disk edges),
# then inverse-project (Mercator) to lon/lat.
import json, math, sys
import numpy as np
from PIL import Image
from scipy import ndimage

im = np.asarray(Image.open(sys.argv[1]).convert('RGBA')).astype(float)
R, G, A = im[..., 0], im[..., 1], im[..., 3]
red = ((A > 200) & (R > 170) & (R - G > 90)).astype(float)
red[:380] = 0  # skip ratings cards

lab, n = ndimage.label(red)
areas = ndimage.sum(red, lab, range(1, n + 1))
iso = np.median([a for a in areas if a < 400])
r = math.sqrt(iso / math.pi)
print('radius', round(r, 2), file=sys.stderr)

sm = ndimage.gaussian_filter(red, 1.0)
gy, gx = np.gradient(sm)
mag = np.hypot(gx, gy)
edge = mag > 0.08
acc = np.zeros_like(red)
ys, xs = np.nonzero(edge)
ux, uy = gx[ys, xs] / mag[ys, xs], gy[ys, xs] / mag[ys, xs]
cx = np.round(xs + r * ux).astype(int)
cy = np.round(ys + r * uy).astype(int)
ok = (cx >= 0) & (cy >= 0) & (cx < red.shape[1]) & (cy < red.shape[0])
np.add.at(acc, (cy[ok], cx[ok]), 1)
acc = ndimage.gaussian_filter(acc, 1.2) * red  # centres must sit on red
mx = ndimage.maximum_filter(acc, size=int(sys.argv[3]) if len(sys.argv) > 3 else 6)
peaks = (acc == mx) & (acc > float(sys.argv[4]) if len(sys.argv) > 4 else acc > 1.5)
lab, n = ndimage.label(peaks)
pts = ndimage.center_of_mass(peaks, lab, range(1, n + 1))

a = (1725 - 165) / (151.21 + 157.86)
b = 165 + 157.86 * a
k = a * 180 / math.pi
merc = lambda lat: math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
c = 895 + k * merc(21.31)
out = []
for y, x in pts:
    lon = (x - b) / a
    lat = math.degrees(2 * math.atan(math.exp((c - y) / k)) - math.pi / 2)
    out.append([round(lon, 2), round(lat, 2)])
print(len(out), file=sys.stderr)
json.dump(out, open(sys.argv[2], 'w'))
