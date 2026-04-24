import csv
from pathlib import Path

MANIFEST = Path("foods_manifest_download.csv")
ROOT = Path(".")

with open(MANIFEST, "r", encoding="utf-8-sig", newline="") as f:
    for row in csv.DictReader(f):
        p = ROOT / row["output_relpath"]
        p.parent.mkdir(parents=True, exist_ok=True)

print("Folder tree initialized.")
