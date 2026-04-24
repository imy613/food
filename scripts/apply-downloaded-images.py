from __future__ import annotations

import argparse
import csv
import hashlib
import json
import shutil
from pathlib import Path


def normalize(value: str) -> str:
    text = str(value or "").strip()
    for token in ("特别行政区", "维吾尔自治区", "壮族自治区", "回族自治区", "自治区", "省", "市"):
        text = text.replace(token, "")
    for token in (" ", "\t", "\n", "·", "-", "_", "（", "）", "(", ")", "、", "，", ",", "。"):
        text = text.replace(token, "")
    return text.lower()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Apply downloaded food photos into provinces.json")
    parser.add_argument(
        "--manifest",
        default="tools/photo_download_toolkit/foods_manifest_download.csv",
        help="CSV manifest path (supports province/region/food/output_relpath columns)",
    )
    parser.add_argument(
        "--toolkit-root",
        default="tools/photo_download_toolkit",
        help="Toolkit root directory. output_relpath is resolved from this root.",
    )
    parser.add_argument(
        "--provinces",
        default="data/provinces.json",
        help="Target provinces json path",
    )
    parser.add_argument(
        "--public-root",
        default="public/images/foods/real",
        help="Output public image root",
    )
    return parser.parse_args()


def pick(row: dict[str, str], keys: list[str]) -> str:
    for key in keys:
        if key in row and str(row[key]).strip():
            return str(row[key]).strip()
    return ""


def main() -> None:
    args = parse_args()
    root = Path.cwd()
    manifest_path = root / args.manifest
    toolkit_root = root / args.toolkit_root
    provinces_path = root / args.provinces
    public_root = root / args.public_root

    if not manifest_path.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")
    if not provinces_path.exists():
        raise FileNotFoundError(f"Provinces data not found: {provinces_path}")

    with provinces_path.open("r", encoding="utf-8") as f:
        provinces = json.load(f)

    province_by_slug = {p["slug"]: p for p in provinces}
    province_by_name = {normalize(p["name"]): p for p in provinces}

    # Canonical mappings for autonomous regions and municipalities.
    canonical = {
        "内蒙古": "inner-mongolia",
        "广西": "guangxi",
        "宁夏": "ningxia",
        "新疆": "xinjiang",
        "西藏": "tibet",
        "香港": "hong-kong",
        "澳门": "macau",
    }

    stats = {
        "rows": 0,
        "updated": 0,
        "missing_source": 0,
        "unmatched_province": 0,
        "unmatched_region": 0,
        "unmatched_food": 0,
    }

    with manifest_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            stats["rows"] += 1

            province_name = pick(row, ["province", "省份"])
            region_name = pick(row, ["region", "分区"])
            food_name = pick(row, ["food", "美食"])
            rel_path = pick(row, ["output_relpath", "本地路径", "local_path"])

            if not (province_name and region_name and food_name and rel_path):
                continue

            province_norm = normalize(province_name)
            province_obj = province_by_name.get(province_norm)
            if not province_obj:
                for key, slug in canonical.items():
                    if normalize(key) == province_norm and slug in province_by_slug:
                        province_obj = province_by_slug[slug]
                        break
            if not province_obj:
                stats["unmatched_province"] += 1
                continue

            source_path = toolkit_root / rel_path
            if not source_path.exists():
                # Try resolving directly from project root.
                source_path = root / rel_path
            if not source_path.exists():
                stats["missing_source"] += 1
                continue

            region = next(
                (r for r in province_obj.get("regions", []) if normalize(r.get("name", "")) == normalize(region_name)),
                None,
            )
            if not region:
                stats["unmatched_region"] += 1
                continue

            food = next(
                (f_item for f_item in region.get("foods", []) if normalize(f_item.get("title", "")) == normalize(food_name)),
                None,
            )
            if not food:
                stats["unmatched_food"] += 1
                continue

            ext = source_path.suffix.lower() if source_path.suffix else ".jpg"
            uid = hashlib.sha1(
                f"{province_obj['slug']}|{region.get('name','')}|{food.get('title','')}".encode("utf-8")
            ).hexdigest()[:16]
            target_dir = public_root / province_obj["slug"]
            target_dir.mkdir(parents=True, exist_ok=True)
            target_path = target_dir / f"{uid}{ext}"
            shutil.copy2(source_path, target_path)

            food["image"] = "/" + target_path.relative_to(root / "public").as_posix()
            stats["updated"] += 1

    with provinces_path.open("w", encoding="utf-8") as f:
        json.dump(provinces, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

