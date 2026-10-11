# Puts real screenshots on the two front-facing iPhone Air screens in mockup.jpg.
# Usage: python3 place.py screenshot.png [second-screenshot.png] out.jpg
#   One screenshot goes on both phones; two put the first on the left phone and the second on the right.
# Needs Pillow and NumPy (pip3 install pillow numpy). Screenshots should be real, portrait, full resolution
# (iPhone Air: 1260x2736), status bar included.
# The screen outlines (left-screen.png, right-screen.png) and corners.json were measured from mockup.jpg;
# the Dynamic Islands are put back on top from the mockup's own pixels.
import sys, json, os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
if len(args) not in (2, 3):
    sys.exit("usage: python3 place.py screenshot.png [second.png] out.jpg")
shots = {"left": args[0], "right": args[1] if len(args) == 3 else args[0]}
out_path = args[-1]

def coeffs(dst, src):
    # PIL maps output (mockup) coordinates back to input (screenshot) coordinates
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()

base = Image.open(os.path.join(HERE, "mockup.jpg")).convert("RGB")
W, H = base.size
lum = np.asarray(base.convert("L")).astype(float)
corners = json.load(open(os.path.join(HERE, "corners.json")))
out = base.copy()
for side in ("left", "right"):
    shot = Image.open(shots[side]).convert("RGB")
    sw, sh = shot.size
    # Pad with the screenshot's own edge pixels so the screen is filled right up to the border.
    p = int(0.05 * sw)
    pad = Image.fromarray(np.pad(np.asarray(shot), ((p, p), (p, p), (0, 0)), mode="edge"))
    src = [(p, p), (sw + p, p), (sw + p, sh + p), (p, sh + p)]
    k = coeffs(corners[side]["corners"], src)
    warped = pad.transform((W, H), Image.PERSPECTIVE, k, Image.BICUBIC)
    out.paste(warped, (0, 0), Image.open(os.path.join(HERE, f"{side}-screen.png")).convert("L"))
    island = np.asarray(Image.open(os.path.join(HERE, f"{side}-island.png")).convert("L")
                        .resize((W, H)).filter(ImageFilter.MaxFilter(9))) > 0
    alpha = np.clip((90 - lum) / 50, 0, 1) * island
    out = Image.composite(base, out, Image.fromarray((alpha * 255).astype(np.uint8)))
out.save(out_path, quality=92)
print(f"wrote {out_path}")
