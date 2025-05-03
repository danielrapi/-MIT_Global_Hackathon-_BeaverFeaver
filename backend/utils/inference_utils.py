from pathlib import Path
import os
import csv
import cv2
import pickle
import json
import numpy as np
from skimage.segmentation import mark_boundaries


def save_prediction_outputs(result, output_dir):
    # Create shared output directories
    os.makedirs(output_dir / "pickles", exist_ok=True)
    os.makedirs(output_dir / "json", exist_ok=True)
    os.makedirs(output_dir / "images", exist_ok=True)  # Base folder for per-image folders

    # Get original filename (e.g., "000" from "000.png")
    original_path = Path(result.image_path[0])
    filename_stem = original_path.stem

    # Create a dedicated folder for this image
    image_folder = output_dir / "images" / filename_stem
    image_folder.mkdir(parents=True, exist_ok=True)

    # CSV log (shared across all images)
    with open(output_dir / "predictions.csv", mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            filename_stem,
            str(original_path),
            float(result.pred_score.item()),
            int(result.pred_label.item())
        ])

    # Save raw result as pickle
    with open(output_dir / "pickles" / f"{filename_stem}_result.pkl", "wb") as f:
        pickle.dump(result, f)

    # Save JSON summary
    summary = {
        "pred_score": float(result.pred_score.item()),
        "pred_label": int(result.pred_label.item())
    }
    with open(output_dir / "json" / f"{filename_stem}_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    # Convert image + masks to numpy arrays
    image = result.image.squeeze().cpu().numpy().transpose(1, 2, 0)
    image = ((image - image.min()) / (image.max() - image.min()) * 255).astype(np.uint8)
    anomaly_map = result.anomaly_map.squeeze().cpu().numpy()
    pred_mask = result.pred_mask.squeeze().cpu().numpy().astype(bool)

    # Save original image
    image_path = image_folder / f"{filename_stem}_image.png"
    cv2.imwrite(str(image_path), cv2.cvtColor(image, cv2.COLOR_RGB2BGR))

    # Save heatmap overlay
    normalized_map = np.clip(1 - anomaly_map, 0, 1)
    heatmap = cv2.applyColorMap((normalized_map * 255).astype(np.uint8), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(image.copy(), 0.6, heatmap, 0.4, 0)
    heatmap_path = image_folder / f"{filename_stem}_heatmap.png"
    cv2.imwrite(str(heatmap_path), cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))

    # Save segmentation mask
    segmented = mark_boundaries(image.copy(), pred_mask, color=(1, 0, 0), mode="thick")
    segmented = (segmented * 255).astype(np.uint8)
    mask_path = image_folder / f"{filename_stem}_mask.png"
    cv2.imwrite(str(mask_path), cv2.cvtColor(segmented, cv2.COLOR_RGB2BGR))

    return int(result.pred_label.item())