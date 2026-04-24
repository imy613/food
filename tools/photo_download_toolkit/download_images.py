from __future__ import annotations
import argparse
import csv
import os
import re
import time
import hashlib
from pathlib import Path
from io import BytesIO

import requests
from PIL import Image
from ddgs import DDGS
from tqdm import tqdm

ROOT = Path(".")
TIMEOUT = 25
MIN_EDGE = 320
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36"

def safe_name(s: str) -> str:
    s = str(s).strip()
    s = re.sub(r'[\\/:*?"<>|]+', "_", s)
    return s.replace(" ", "")

def fetch_image(url: str) -> bytes | None:
    try:
        r = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}, stream=True)
        r.raise_for_status()
        content_type = r.headers.get("Content-Type", "")
        if "image" not in content_type:
            return None
        data = r.content
        if len(data) < 10_000:
            return None
        return data
    except Exception:
        return None

def valid_image(data: bytes) -> Image.Image | None:
    try:
        img = Image.open(BytesIO(data))
        img.load()
        if min(img.size) < MIN_EDGE:
            return None
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        return img
    except Exception:
        return None

def save_jpg(img: Image.Image, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255,255,255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.save(out_path, format="JPEG", quality=90, optimize=True)

def image_search(query: str, max_results: int = 10):
    # Uses ddgs (new package replacing duckduckgo-search)
    try:
        with DDGS() as ddgs:
            for item in ddgs.images(
                query,
                region="wt-wt",
                safesearch="off",
                size="Medium",
                color="color",
                type_image="photo",
                max_results=max_results,
            ):
                yield item
    except Exception:
        return

def download_one(row: dict) -> tuple[str, str]:
    out_path = ROOT / row["output_relpath"]
    if out_path.exists():
        return "exists", str(out_path)

    query = row["search_query"]
    tried = 0
    for result in image_search(query, max_results=12):
        tried += 1
        url = result.get("image")
        if not url:
            continue
        data = fetch_image(url)
        if not data:
            continue
        img = valid_image(data)
        if not img:
            continue
        save_jpg(img, out_path)
        return "downloaded", str(out_path)
    return f"failed_after_{tried}", str(out_path)

def main():
    parser = argparse.ArgumentParser(description="Download food images by manifest csv")
    parser.add_argument("--manifest", default="foods_manifest_download.csv", help="CSV manifest path")
    parser.add_argument("--delay", type=float, default=0.3, help="Sleep seconds between rows")
    args = parser.parse_args()

    manifest = Path(args.manifest)
    if not manifest.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest}")

    rows = []
    with open(manifest, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    log_path = ROOT / "download_log.csv"
    done = 0
    with open(log_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["province", "region", "food", "status", "saved_path"])
        for row in tqdm(rows, desc="Downloading images"):
            status, saved_path = download_one(row)
            writer.writerow([row["province"], row["region"], row["food"], status, saved_path])
            f.flush()
            if status in ("downloaded", "exists"):
                done += 1
            if args.delay > 0:
                time.sleep(args.delay)

    print(f"Done: {done}/{len(rows)}")
    print(f"Log: {log_path}")

if __name__ == "__main__":
    main()
