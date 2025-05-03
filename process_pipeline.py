import argparse
from pathlib import Path
import json
from utils.inference_utils import save_prediction_outputs
from utils.exif_utils import extract_gps_from_exif_or_generate
from utils.llm_utils import annotate_picture, get_embedding_from_annotation
from anomalib.engine import Engine
from anomalib.models import Patchcore
from anomalib.data import PredictDataset


def run_pipeline(image_dir: Path, output_dir: str):
    image_paths = list(image_dir.glob("*.png"))
    if not image_paths:
        raise FileNotFoundError(f"No PNG images found in {image_dir}")

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("🔍 Running anomaly detection...")
    engine = Engine()
    dataset = PredictDataset(path=image_dir, image_size=(320, 256))
    model = Patchcore(
        backbone="resnet18",
        layers=["layer2", "layer3"],
        pre_trained=True,
        coreset_sampling_ratio=0.1,
        num_neighbors=9,
    )

    checkpoint_path = Path("results/Patchcore/drone/latest/weights/lightning/model.ckpt")
    if not checkpoint_path.exists():
        raise FileNotFoundError("Checkpoint not found")

    results = engine.predict(model=model, dataset=dataset, ckpt_path=checkpoint_path)

    print("💾 Saving inference results...")
    for result in results:
        save_prediction_outputs(result, output_dir)

        filename_stem = Path(result.image_path[0]).stem
        mask_path = output_dir / "images" / filename_stem / f"{filename_stem}_mask.png"
        json_path = output_dir / "json" / f"{filename_stem}_summary.json"

        print(f"🧠 Annotating {filename_stem}_mask.png with LLM...")
        annotation = annotate_picture(str(mask_path))
        if annotation:
            embedding = get_embedding_from_annotation(annotation)
            lat, lon = extract_gps_from_exif_or_generate(result.image_path[0])

            with open(json_path, "r") as f:
                summary = json.load(f)
            summary = {"id": filename_stem, "latitude": lat, "longitude": lon, **summary}  # Place GPS before annotation
            summary["annotation"] = annotation
            summary["embedding"] = embedding

            with open(json_path, "w") as f:
                json.dump(summary, f, indent=2)

            print(f"✅ Annotation, GPS, and embedding saved to {json_path}")
        else:
            print(f"⚠️ No annotation returned for {filename_stem}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run full pipeline on all drone images in a directory")
    parser.add_argument("--image_dir", type=str, required=True, help="Directory containing PNG images")
    parser.add_argument("--output_dir", type=str, default="inference_outputs", help="Directory to save results")
    args = parser.parse_args()

    run_pipeline(Path(args.image_dir), args.output_dir)
