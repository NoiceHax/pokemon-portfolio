"""
Who's That Pokémon? - step 2: turn the artwork into silhouettes.

The model step: rembg's IS-Net segmentation model (isnet-general-use, a U²-Net successor)
predicts a foreground mask from the artwork's pixels alone. The official art also ships
with an alpha channel, and the two are combined per connected piece of the artwork:

  a piece of the alpha mask is kept whole if the model sees at least 25% of it
  (the largest piece is always kept)

So the model can drop detached things it doesn't see as the Pokémon - stray sparkles,
effect specks - but can never slice a body in half where it misses a pale region (it used
to, per pixel: Dratini lost its white belly). The alpha channel keeps edges crisp and
anti-aliased. Then holes are filled and what's left is painted one ink colour.

Per Pokémon, under random, non-guessable tokens - one per file, so nothing about a file
gives away the dex number or leads from one file to another:
  src/lib/wtp/data/silhouettes/<token>.webp  silhouette - private: never served as a static
                                             file, only streamed by /api/wtp/round-image
  public/assets/wtp/r/<token>.webp           colour reveal (same crop)
  public/assets/wtp/c/<token>.mp3            legacy cry

Also writes the server-only answer file src/lib/wtp/data/pokemon.json, and a QA contact
sheet plus an IoU / coverage report to .cache/. Model masks are cached in .cache/masks/,
so a rerun only runs the model for new artwork. Tokens already in pokemon.json are
reused, so a rerun overwrites files instead of orphaning them.

Run (after fetch.py): python scripts/whos-that-pokemon/silhouette.py
"""
import json
import os
import secrets
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
CACHE = os.path.join(HERE, ".cache")
OUT_ASSETS = os.path.join(ROOT, "public", "assets", "wtp")
OUT_SILHOUETTES = os.path.join(ROOT, "src", "lib", "wtp", "data", "silhouettes")
OUT_JSON = os.path.join(ROOT, "src", "lib", "wtp", "data", "pokemon.json")
TEASER = os.path.join(ROOT, "public", "assets", "sprites", "wtp_teaser.webp")

SIZE = 320              # output square, px
PAD = 0.06              # padding around the cropped subject, as a fraction of its size
INK = (16, 20, 38)      # silhouette colour: near-black navy, like the anime card
IOU_WARN = 0.9
PIECE_SUPPORT = 0.25    # share of an alpha piece the model must cover for it to be kept
COVERAGE_WARN = 0.98    # flag silhouettes that dropped more than 2% of the art's pixels
TEASER_ID = 25          # the sidebar's decorative silhouette


def model_mask(session, rgba, pid):
    # The model sees RGB only, so the art is flattened onto a background first. A pale
    # Pokémon (Clefairy, Dewgong) vanishes into white and a dark one into black, so run it
    # on both and take the union. Cached: the model is the slow part.
    cached = os.path.join(CACHE, "masks", f"{pid}.png")
    if os.path.exists(cached):
        return np.asarray(Image.open(cached)) > 127
    masks = []
    for bg in ((255, 255, 255), (0, 0, 0)):
        flat = Image.new("RGB", rgba.size, bg)
        flat.paste(rgba, mask=rgba.split()[3])
        masks.append(np.asarray(remove(flat, session=session, only_mask=True)) > 127)
    mask = masks[0] | masks[1]
    os.makedirs(os.path.dirname(cached), exist_ok=True)
    Image.fromarray((mask * 255).astype(np.uint8)).save(cached)
    return mask


def combine(alpha_mask, predicted):
    """Keep each connected piece of the art whole if the model supports it (see top)."""
    labels, n = ndimage.label(alpha_mask)
    if n == 0:
        return alpha_mask
    idx = range(1, n + 1)
    sizes = ndimage.sum(alpha_mask, labels, idx)
    support = ndimage.sum(predicted, labels, idx) / np.maximum(sizes, 1)
    largest = int(np.argmax(sizes))
    keep = [i + 1 for i in range(n) if i == largest or support[i] >= PIECE_SUPPORT]
    return np.isin(labels, keep)


def clean(mask, min_frac=0.002):
    mask = ndimage.binary_fill_holes(mask)
    labels, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum(mask, labels, range(1, n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s >= min_frac * mask.size]
        mask = np.isin(labels, keep)
    return mask


def square_crop_box(mask, w, h):
    ys, xs = np.nonzero(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    side = max(x1 - x0, y1 - y0)
    side = int(side * (1 + 2 * PAD))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    return (cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side)


def to_cry_mp3(src, dst):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ac", "1", "-b:a", "64k", dst],
        check=True,
    )


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # names like Nidoran♀ on a cp1252 console
    with open(os.path.join(CACHE, "records.json"), encoding="utf-8") as f:
        records = json.load(f)
    old_tokens = {}
    if os.path.exists(OUT_JSON):
        with open(OUT_JSON, encoding="utf-8") as f:
            old_tokens = {r["id"]: r["assets"] for r in json.load(f)}
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required to convert cries to mp3.")

    for sub in ("r", "c"):
        os.makedirs(os.path.join(OUT_ASSETS, sub), exist_ok=True)
    os.makedirs(OUT_SILHOUETTES, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)

    session = None
    report, thumbs, truncated_before = [], [], []
    for rec in records:
        pid = rec["id"]
        tokens = old_tokens.get(pid) or {k: secrets.token_hex(6) for k in ("s", "r", "c")}
        rec["assets"] = tokens

        art = Image.open(os.path.join(CACHE, "art", f"{pid}.png")).convert("RGBA")
        alpha = np.asarray(art.split()[3])
        alpha_mask = alpha > 32
        if session is None and not os.path.exists(os.path.join(CACHE, "masks", f"{pid}.png")):
            session = new_session("isnet-general-use")
        predicted = model_mask(session, art, pid)
        iou = (alpha_mask & predicted).sum() / max((alpha_mask | predicted).sum(), 1)

        keep = clean(combine(alpha_mask, predicted))
        coverage = (keep & alpha_mask).sum() / max(alpha_mask.sum(), 1)
        # What the old per-pixel rule (alpha AND dilated model) would have kept, so the run
        # reports every Pokémon it used to cut short.
        old = clean(alpha_mask & ndimage.binary_dilation(predicted, iterations=6))
        old_cov = (old & alpha_mask).sum() / max(alpha_mask.sum(), 1)
        if old_cov < COVERAGE_WARN:
            truncated_before.append((pid, rec["name"], round(float(old_cov), 3)))

        # Silhouette: solid ink, with the original alpha inside the kept region so the
        # outline stays anti-aliased rather than jagged.
        sil_alpha = np.where(keep | ndimage.binary_dilation(keep, iterations=1), alpha, 0)
        sil = np.zeros((*alpha.shape, 4), dtype=np.uint8)
        sil[..., :3] = INK
        sil[..., 3] = sil_alpha.astype(np.uint8)
        sil_img = Image.fromarray(sil, "RGBA")
        reveal = art.copy()
        reveal.putalpha(Image.fromarray(sil_alpha.astype(np.uint8)))

        box = square_crop_box(keep, *art.size)
        for img, path in (
            (sil_img, os.path.join(OUT_SILHOUETTES, f"{tokens['s']}.webp")),
            (reveal, os.path.join(OUT_ASSETS, "r", f"{tokens['r']}.webp")),
        ):
            out = img.crop(box).resize((SIZE, SIZE), Image.LANCZOS)
            out.save(path, "WEBP", quality=86, method=6)
        thumbs.append(sil_img.crop(box).resize((96, 96), Image.LANCZOS))

        if rec["hasCry"]:
            to_cry_mp3(os.path.join(CACHE, "cry", f"{pid}.ogg"), os.path.join(OUT_ASSETS, "c", f"{tokens['c']}.mp3"))
        if pid == TEASER_ID:
            sil_img.crop(box).resize((128, 128), Image.LANCZOS).save(TEASER, "WEBP", quality=90)

        report.append((pid, rec["name"], round(float(iou), 3), round(float(coverage), 3)))
        if pid % 25 == 0:
            print(f"  processed {pid}/{len(records)}")

    # QA contact sheet: every silhouette on white, 16 per row.
    cols = 16
    rows = -(-len(thumbs) // cols)
    sheet = Image.new("RGBA", (cols * 96, rows * 96), (255, 255, 255, 255))
    for i, t in enumerate(thumbs):
        sheet.alpha_composite(t, ((i % cols) * 96, (i // cols) * 96))
    sheet.save(os.path.join(CACHE, "contact-sheet.png"))

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=1)
        f.write("\n")

    low = [r[:3] for r in report if r[2] < IOU_WARN]
    dropped = [(r[0], r[1], r[3]) for r in report if r[3] < COVERAGE_WARN]
    with open(os.path.join(CACHE, "iou-report.txt"), "w", encoding="utf-8") as f:
        f.write("id  name         iou    coverage\n")
        for r in sorted(report, key=lambda r: r[2]):
            f.write(f"{r[0]:>3} {r[1]:<12} {r[2]:<6} {r[3]}\n")
    print(f"Wrote {len(records)} Pokémon to {os.path.relpath(OUT_JSON, ROOT)}")
    print(f"Model vs alpha IoU below {IOU_WARN}: {low or 'none'}")
    print(f"Coverage below {COVERAGE_WARN} (art pixels dropped): {dropped or 'none'}")
    print(f"Cut short by the old per-pixel rule: {truncated_before or 'none'}")
    print(f"Contact sheet: {os.path.join(CACHE, 'contact-sheet.png')}")


if __name__ == "__main__":
    main()
