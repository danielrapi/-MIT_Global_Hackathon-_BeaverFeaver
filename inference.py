from anomalib.engine import Engine
from anomalib.models import Patchcore
from anomalib.data import PredictDataset
from anomalib.utils.post_processing import superimpose_anomaly_map

from pathlib import Path
import os
import csv
import cv2
import pickle
import json
import numpy as np
from skimage.segmentation import mark_boundaries


def generate_training_style_visualization(image, anomaly_map, pred_mask=None, normalize=True):
    """Mimics training visualization outputs."""
    if image.ndim == 4:
        image = image.squeeze(0)
    if anomaly_map.ndim == 3:
        anomaly_map = anomaly_map.squeeze(0)

    image_np = image.detach().cpu().numpy().transpose(1, 2, 0)
    image_np = ((image_np - image_np.min()) / (image_np.max() - image_np.min()) * 255).astype(np.uint8)
    anomaly_map_np = anomaly_map.detach().cpu().numpy()

    heatmap_overlay = superimpose_anomaly_map(anomaly_map_np, image_np.copy(), normalize=normalize)

    if pred_mask is not None:
        if pred_mask.ndim == 3:
            pred_mask = pred_mask.squeeze(0)
        pred_mask_np = pred_mask.detach().cpu().numpy().astype(np.bool_)
        segmentations = mark_boundaries(heatmap_overlay, pred_mask_np, color=(1, 0, 0))
        segmentations = (segmentations * 255).astype(np.uint8)
        return cv2.cvtColor(segmentations, cv2.COLOR_RGB2BGR)

    return cv2.cvtColor(heatmap_overlay, cv2.COLOR_RGB2BGR)


def save_prediction_outputs(result, output_dir):
    os.makedirs(output_dir / "heatmaps", exist_ok=True)
    os.makedirs(output_dir / "masks", exist_ok=True)
    os.makedirs(output_dir / "pickles", exist_ok=True)
    os.makedirs(output_dir / "json", exist_ok=True)

    # Extract original image filename (e.g., "000" from "000.png")
    image_path = Path(result.image_path[0])
    filename_stem = image_path.stem

    # CSV log
    with open(output_dir / "predictions.csv", mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            filename_stem,
            result.image_path[0],
            float(result.pred_score.item()),
            int(result.pred_label.item())
        ])

    # Pickle raw result
    with open(output_dir / "pickles" / f"{filename_stem}_result.pkl", "wb") as f:
        pickle.dump(result, f)

    # JSON summary
    summary = {
        "image_path": result.image_path[0],
        "pred_score": float(result.pred_score.item()),
        "pred_label": int(result.pred_label.item())
    }
    with open(output_dir / "json" / f"{filename_stem}_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    # Convert tensors to numpy arrays
    image = result.image.squeeze().cpu().numpy().transpose(1, 2, 0)
    image = ((image - image.min()) / (image.max() - image.min()) * 255).astype(np.uint8)
    anomaly_map = result.anomaly_map.squeeze().cpu().numpy()
    pred_mask = result.pred_mask.squeeze().cpu().numpy().astype(bool)

    # 1. Save heatmap overlay
    normalized_map = np.clip(1 - anomaly_map, 0, 1)
    heatmap = cv2.applyColorMap((normalized_map * 255).astype(np.uint8), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(image.copy(), 0.6, heatmap, 0.4, 0)
    heatmap_path = output_dir / "heatmaps" / f"{filename_stem}_heatmap.png"
    cv2.imwrite(str(heatmap_path), cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))

    # 2. Save mask with boundaries
    segmented = mark_boundaries(image.copy(), pred_mask, color=(1, 0, 0), mode="thick")
    segmented = (segmented * 255).astype(np.uint8)
    mask_path = output_dir / "masks" / f"{filename_stem}_mask.png"
    cv2.imwrite(str(mask_path), cv2.cvtColor(segmented, cv2.COLOR_RGB2BGR))


if __name__ == "__main__":
    engine = Engine()

    # Load dataset with specified image size
    dataset = PredictDataset(path=Path("datasets/drone/all_test"), image_size=(256, 320))

    # Load model and checkpoint
    checkpoint_path = "results/Patchcore/drone/latest/weights/lightning/model.ckpt"
    if not Path(checkpoint_path).exists():
        print(f"Checkpoint not found: {checkpoint_path}")
        exit(1)

    model = Patchcore(
        backbone="resnet18",
        layers=["layer2", "layer3"],
        pre_trained=True,
        coreset_sampling_ratio=0.1,
        num_neighbors=9,
    )

    print("Running inference...")
    results = engine.predict(model=model, dataset=dataset, ckpt_path=checkpoint_path)

    output_dir = Path("inference_outputs")
    output_dir.mkdir(exist_ok=True)
    print(f"Saving results to {output_dir}")

    for result in results:
        save_prediction_outputs(result, output_dir)
