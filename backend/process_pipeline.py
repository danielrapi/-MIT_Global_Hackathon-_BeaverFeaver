from pathlib import Path
import json
import shutil
from utils.inference_utils import save_prediction_outputs
from utils.exif_utils import extract_gps_from_exif_or_generate
from utils.llm_utils import annotate_picture, get_embedding_from_annotation
from anomalib.engine import Engine
from anomalib.models import Patchcore
from anomalib.data import PredictDataset

engine = Engine()
model = Patchcore(
    backbone="resnet18",
    layers=["layer2", "layer3"],
    pre_trained=True,
    coreset_sampling_ratio=0.1,
    num_neighbors=9,
)

checkpoint_path = Path(__file__).parent / "patchcore/drone/v25/weights/lightning/model.ckpt"
print(f"🔍 Loading checkpoint from {checkpoint_path}")

def run_pipeline(image_path: Path, output_dir: str):
    """Process a single image through the anomaly detection pipeline."""
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    # Create a temporary directory for the single image
    temp_dir = Path("temp_processing")
    temp_dir.mkdir(exist_ok=True)
    
    try:
        # Copy the image to the temp directory
        temp_image_path = temp_dir / image_path.name
        shutil.copy2(image_path, temp_image_path)
        
        # Create dataset with just this image
        dataset = PredictDataset(path=temp_dir, image_size=(320, 256))
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        print("🔍 Running anomaly detection...")
        print(f"🔍 Running anomaly detection on image: {image_path.name}")
        
        if not checkpoint_path.exists():
            raise FileNotFoundError("Checkpoint not found")
        print(f"🔍 Loading checkpoint from {checkpoint_path}")
        results = engine.predict(model=model, dataset=dataset, ckpt_path=checkpoint_path)
        print("💾 Saving inference results...")
        
        processed_results = []
        for result in results:
            label = save_prediction_outputs(result, output_dir)

            filename_stem = Path(result.image_path[0]).stem
            mask_path = output_dir / "images" / filename_stem / f"{filename_stem}_mask.png"
            heat_map_path = output_dir / "images" / filename_stem / f"{filename_stem}_heatmap.png"
            image_path = output_dir / "images" / filename_stem / f"{filename_stem}_image.png"
            json_path = output_dir / "json" / f"{filename_stem}_summary.json"
            lat, lon = extract_gps_from_exif_or_generate(result.image_path[0])

            with open(json_path, "r") as f:
                summary = json.load(f)
            summary = {"id": filename_stem, "latitude": lat, "longitude": lon, **summary}

            if label == 1:
                print(f"🧠 Annotating {filename_stem}_mask.png with LLM...")
                annotation = annotate_picture(str(mask_path))
                if annotation:
                    embedding = get_embedding_from_annotation(annotation)
                    
                    summary["annotation"] = annotation
                    summary["embedding"] = embedding

            with open(json_path, "w") as f:
                json.dump(summary, f, indent=2)

            print(f"✅ Annotation, GPS, and embedding saved to {json_path}")
            
            processed_results.append({
                "mask_path": str(mask_path),
                "heat_map_path": str(heat_map_path),
                "image_path": str(image_path),
                "json_summary": summary
            })
    
        return processed_results
    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run full pipeline on all drone images in a directory")
    parser.add_argument("--image_dir", type=str, required=True, help="Directory containing PNG images")
    parser.add_argument("--output_dir", type=str, default="inference_outputs", help="Directory to save results")
    args = parser.parse_args()

    run_pipeline(Path(args.image_dir), args.output_dir)
