"""
Crops tight square head-shots from the 8 wrestling-card source images.

Each entry below specifies, in normalized fractions of the source image,
the CENTER of the face (cx, cy) and the half-side of a square crop (h).
The crop is then resized to 512x512 PNG.

Tweak (cx, cy, h) values and re-run to nudge any face. A contact sheet
is written to _contact.jpg so you can eyeball all 8 in one image.
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC  = ROOT / "source"
OUT  = ROOT
OUT_SIZE = 512  # final avatar resolution

# (cx_frac, cy_frac, half_side_frac) — half_side as fraction of MIN(W,H)
# Tuned for the 8 specific cards. Higher h = wider crop = looser shot.
CROPS = {
    "bill":  (0.43, 0.270, 0.15),  # The Closer — center face, clear of title bar above
    "eric":  (0.50, 0.130, 0.20),  # The Playcaller — bald, full beard
    "sonny": (0.40, 0.115, 0.18),  # Showtime — young, short hair
    "doug":  (0.42, 0.135, 0.20),  # Dropkick Dougie — grey beard
    "sumit": (0.50, 0.215, 0.17),  # The Storm — head + beard, clear of title bar above
    "brady": (0.40, 0.115, 0.18),  # The Breakker — young, mustache
    "vlad":  (0.42, 0.130, 0.18),  # Vlad — high hair
    "bob":   (0.40, 0.130, 0.20),  # Big Bad Bob — mustache + goatee
}

def crop_one(name: str, cx_f: float, cy_f: float, h_f: float) -> Image.Image:
    src_path = SRC / f"{name}.png"
    im = Image.open(src_path).convert("RGB")
    W, H = im.size
    base = min(W, H)
    cx, cy = int(cx_f * W), int(cy_f * H)
    half  = int(h_f * base)

    # Square crop, clamped to image bounds (shifts inward instead of letterboxing)
    left   = max(0, cx - half)
    top    = max(0, cy - half)
    right  = min(W, cx + half)
    bottom = min(H, cy + half)

    # If clamping broke the square, re-square from the clamped box
    side = min(right - left, bottom - top)
    right  = left + side
    bottom = top  + side

    crop = im.crop((left, top, right, bottom))
    return crop.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)

def main():
    crops = {}
    for name, (cx, cy, h) in CROPS.items():
        out = crop_one(name, cx, cy, h)
        out.save(OUT / f"{name}.png", optimize=True)
        crops[name] = out
        print(f"  ✓ {name}.png")

    # Contact sheet: 4 across × 2 down at 256px each
    cell = 256
    sheet = Image.new("RGB", (cell * 4, cell * 2), (10, 12, 20))
    order = ["bill", "eric", "sonny", "doug", "sumit", "brady", "vlad", "bob"]
    for i, name in enumerate(order):
        col, row = i % 4, i // 4
        sheet.paste(crops[name].resize((cell, cell), Image.LANCZOS),
                    (col * cell, row * cell))
    sheet.save(OUT / "_contact.jpg", quality=88)
    print("Contact sheet -> _contact.jpg")

if __name__ == "__main__":
    main()
