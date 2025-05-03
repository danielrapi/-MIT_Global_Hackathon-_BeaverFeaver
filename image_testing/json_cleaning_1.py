import json
from pathlib import Path

summary_dir = Path("inference_outputs/json")
llm_annotation_path = Path("image_testing/annotations_v2.json")

with open(llm_annotation_path, "r") as f:
    llm_data = json.load(f)

for mask_filename, annotation in llm_data.items():
    stem = mask_filename.split("_")[0]  # e.g., "000" from "000_mask.png"
    summary_file = summary_dir / f"{stem}_summary.json"

    if summary_file.exists():
        with open(summary_file, "r") as f:
            summary = json.load(f)

        summary["annotation"] = annotation

        with open(summary_file, "w") as f:
            json.dump(summary, f, indent=2)

        print(f"✅ Updated {summary_file.name}")
    else:
        print(f"⚠️  Summary file not found for: {stem}")
