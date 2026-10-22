"""Generate a 1200x675 OG title card in the existing Trackbase blog style.

Usage: python pipeline/og-card.py --slug my-post --title "My title" [--out og/my-post.png]
Style sampled from the cards already in the Blog CMS: navy background (14,29,69),
light-blue brand line, bold white title, "trackbase.ai" footer, blue bar at the bottom.
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 675
BG = (14, 29, 69)
BAR = (24, 102, 225)
MUTED = (171, 201, 243)
WHITE = (255, 255, 255)
FONT_DIR = os.path.join(os.environ.get("WINDIR", "C:/Windows"), "Fonts")


def font(bold, size):
    candidates = (
        ["arialbd.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"]
        if bold
        else ["arial.ttf", "DejaVuSans.ttf", "Arial.ttf"]
    )
    for name in candidates:
        for d in (FONT_DIR, "/usr/share/fonts/truetype/dejavu", "/usr/share/fonts/truetype/msttcorefonts", "."):
            p = os.path.join(d, name)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--out")
    ap.add_argument("--brand", default="Trackbase")
    ap.add_argument("--footer", default="trackbase.ai")
    a = ap.parse_args()
    out = a.out or os.path.join("og", f"{a.slug}.png")
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)

    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, H - 20, W, H], fill=BAR)
    d.text((70, 70), a.brand, font=font(False, 30), fill=MUTED)

    size = 64
    while size >= 40:
        f = font(True, size)
        lines = wrap(d, a.title, f, W - 140)
        line_h = int(size * 1.2)
        if len(lines) * line_h <= 330:
            break
        size -= 4
    total_h = len(lines) * line_h
    y = max(170, (H - 60 - total_h) // 2 - 10)
    for ln in lines:
        d.text((70, y), ln, font=f, fill=WHITE)
        y += line_h

    d.text((70, H - 90), a.footer, font=font(False, 30), fill=MUTED)
    im.save(out, "PNG", optimize=True)
    print(out)


if __name__ == "__main__":
    sys.exit(main())
