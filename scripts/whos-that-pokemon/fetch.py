"""
Who's That Pokémon? - step 1: pull the raw data for Gen 1 + 2 (#1-251) from PokeAPI.

For each Pokémon we read three PokeAPI resources - pokemon/{id}, pokemon-species/{id} and
evolution-chain/{id} - and keep only the fields the game uses for hints. We also download
the official artwork and the legacy (Game Boy era) cry. Everything raw is cached under
.cache/ so a rerun makes no network calls.

Output:
  .cache/records.json   - the trimmed records (silhouette.py adds the asset tokens and
                          writes the final server-only JSON into src/lib/wtp/data/)
  .cache/art/{id}.png   - official artwork
  .cache/cry/{id}.ogg   - legacy cry

Run: python scripts/whos-that-pokemon/fetch.py
"""
import json
import os
import re
import sys
import time

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
API = "https://pokeapi.co/api/v2"
LAST_ID = 251

# Gen 1/2 games only, so every Pokédex entry is era-authentic. Earlier = preferred.
FLAVOR_VERSIONS = ["crystal", "yellow", "gold", "silver", "red", "blue"]

session = requests.Session()
session.headers["User-Agent"] = "trainer-chandan-portfolio/1.0 (whos-that-pokemon build script)"


def cached_get(url, path, binary=False):
    """GET url, caching the body at path. Sleeps briefly on a miss to stay polite."""
    full = os.path.join(CACHE, path)
    if os.path.exists(full):
        with open(full, "rb") as f:
            data = f.read()
        return data if binary else json.loads(data)
    for attempt in range(4):
        try:
            res = session.get(url, timeout=30)
            if res.status_code == 404:
                return None
            res.raise_for_status()
            break
        except requests.RequestException as e:
            if attempt == 3:
                raise
            print(f"  retry {url}: {e}", file=sys.stderr)
            time.sleep(2 ** attempt)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "wb") as f:
        f.write(res.content)
    time.sleep(0.1)
    return res.content if binary else res.json()


def english(entries, key):
    for e in entries:
        if e["language"]["name"] == "en":
            return e[key]
    return None


def clean_text(s):
    # Game text uses form feeds, soft hyphens and hard line breaks for the tiny screen.
    # A soft hyphen marks a word broken across lines ("sto\u00ad\frms"), so it and the
    # break after it go entirely.
    s = re.sub("\u00ad\\s*", "", s)
    s = s.replace("\f", " ").replace("\n", " ")
    return re.sub(r"\s+", " ", s).strip()


def pick_flavor(species):
    by_version = {}
    for e in species["flavor_text_entries"]:
        if e["language"]["name"] == "en":
            by_version.setdefault(e["version"]["name"], clean_text(e["flavor_text"]))
    for v in FLAVOR_VERSIONS:
        if v in by_version:
            return {"text": by_version[v], "game": v}
    return None


def walk_chain(node, stage=1, parent=None, out=None):
    """Flatten an evolution chain into {species_name: (stage, parent_name, child_count)}."""
    out = {} if out is None else out
    name = node["species"]["name"]
    out[name] = (stage, parent, len(node["evolves_to"]))
    for child in node["evolves_to"]:
        walk_chain(child, stage + 1, name, out)
    return out


def era_types(mon):
    """Types as they were in Gen 2 (Gold/Silver/Crystal). `past_types` lists a Pokémon's
    types *up to* a given generation - Clefairy was Normal through Gen V, before Fairy
    existed; Magnemite was pure Electric only in Gen I - so the earliest entry from Gen II
    on is the Gen 2 typing, and with none the current types still apply."""
    past = sorted(
        (p for p in mon.get("past_types") or [] if species_id(p["generation"]["url"]) >= 2),
        key=lambda p: species_id(p["generation"]["url"]),
    )
    slots = past[0]["types"] if past else mon["types"]
    return [t["type"]["name"] for t in sorted(slots, key=lambda t: t["slot"])]


def species_id(url):
    return int(url.rstrip("/").split("/")[-1])


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    os.makedirs(CACHE, exist_ok=True)
    raw = {}
    for pid in range(1, LAST_ID + 1):
        mon = cached_get(f"{API}/pokemon/{pid}", f"api/pokemon/{pid}.json")
        spec = cached_get(f"{API}/pokemon-species/{pid}", f"api/species/{pid}.json")
        chain_id = species_id(spec["evolution_chain"]["url"])
        chain = cached_get(f"{API}/evolution-chain/{chain_id}", f"api/chain/{chain_id}.json")
        raw[pid] = (mon, spec, chain)
        if pid % 25 == 0:
            print(f"  fetched {pid}/{LAST_ID}")

    # Display names, for resolving evolves-from (only within #1-251 - a Gen 3+ relative
    # would be an off-era spoiler, so it's dropped).
    display = {raw[i][1]["name"]: english(raw[i][1]["names"], "name") for i in raw}

    records = []
    for pid, (mon, spec, chain) in raw.items():
        name = display[spec["name"]]
        stage, parent, children = walk_chain(chain["chain"])[spec["name"]]
        art_url = mon["sprites"]["other"]["official-artwork"]["front_default"]
        cry_url = (mon.get("cries") or {}).get("legacy") or (mon.get("cries") or {}).get("latest")
        cached_get(art_url, f"art/{pid}.png", binary=True)
        has_cry = bool(cry_url) and cached_get(cry_url, f"cry/{pid}.ogg", binary=True) is not None

        records.append({
            "id": pid,
            "slug": spec["name"],
            "name": name,
            "gen": 1 if spec["generation"]["name"] == "generation-i" else 2,
            "types": era_types(mon),
            "genus": english(spec["genera"], "genus"),
            "flavor": pick_flavor(spec),
            "heightM": mon["height"] / 10,
            "weightKg": mon["weight"] / 10,
            "color": spec["color"]["name"] if spec["color"] else None,
            "habitat": spec["habitat"]["name"] if spec["habitat"] else None,
            "shape": spec["shape"]["name"] if spec["shape"] else None,
            "legendary": spec["is_legendary"] or spec["is_mythical"],
            "evolution": {
                "stage": stage,
                "from": display.get(parent) if parent else None,
                "evolvesFurther": children > 0,
            },
            "hasCry": has_cry,
        })

    missing = [r["id"] for r in records if not (r["genus"] and r["flavor"] and r["types"])]
    with open(os.path.join(CACHE, "records.json"), "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=1)
    print(f"Wrote {len(records)} records. Missing hint fields: {missing or 'none'}")
    print(f"Without a cry: {[r['id'] for r in records if not r['hasCry']] or 'none'}")


if __name__ == "__main__":
    main()
