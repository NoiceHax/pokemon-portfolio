# Who's That Pokémon? data pipeline

These scripts build the game's data and art for Gen 1 + 2 (#1–251), starting from raw PokeAPI. They are run by hand, and their output is committed, so neither the site build nor the deploy needs Python.

| Step | Script | Output |
|---|---|---|
| 1. Fetch | `fetch.py` | Raw PokeAPI JSON, official artwork and legacy cries, written to `.cache/`. Also writes `.cache/records.json`, the trimmed hint data. |
| 2. Silhouettes | `silhouette.py` | `src/lib/wtp/data/silhouettes/<token>.webp` (private; streamed by `/api/wtp/round-image`), `public/assets/wtp/{r,c}/<token>.*`, `src/lib/wtp/data/pokemon.json` (server-only answers), `public/assets/sprites/wtp_teaser.webp`, plus a QA contact sheet and an IoU report in `.cache/` |

## The model step

`silhouette.py` runs rembg's IS-Net segmentation model (`isnet-general-use`) to predict a foreground mask from each artwork's pixels. It runs on both a white and a black background so pale and dark Pokémon both register. The two masks are combined per connected piece of the artwork's alpha channel:

- a piece is kept whole if the model covers at least 25% of it, and the largest piece is always kept
- the model can drop detached effects that aren't part of the Pokémon, but it can never slice a body where it misses a pale region (Dratini's white belly)
- the alpha channel gives crisp, anti-aliased edges

Holes are then filled, specks are dropped, and the shape is painted one ink colour. Model masks are cached in `.cache/masks/`, so reruns are fast.

`iou-report.txt` lists, for each Pokémon, the model/alpha overlap (IoU) and the coverage, meaning the share of the art's pixels the silhouette keeps. The script flags any coverage below 98%; check those on `contact-sheet.png`.

## Anti-cheat filenames

Every asset gets its own random token, so a filename never reveals the dex number and one file can't be turned into another. Silhouettes aren't in `public/` at all: the API re-encodes them per request, so neither a URL nor a byte hash identifies an answer. The token map lives only in `pokemon.json`, which only API routes import. A rerun reuses the existing tokens.

## Running

```sh
python -m venv scripts/whos-that-pokemon/.venv
scripts/whos-that-pokemon/.venv/Scripts/python -m pip install -r scripts/whos-that-pokemon/requirements.txt
scripts/whos-that-pokemon/.venv/Scripts/python -I scripts/whos-that-pokemon/fetch.py
scripts/whos-that-pokemon/.venv/Scripts/python -I scripts/whos-that-pokemon/silhouette.py
```

On macOS/Linux the venv binary is `.venv/bin/python`.

- `ffmpeg` must be on PATH, to convert the cries from .ogg to .mp3 for Safari.
- The first run of `silhouette.py` downloads the model, about 170 MB, into `~/.u2net/`.
