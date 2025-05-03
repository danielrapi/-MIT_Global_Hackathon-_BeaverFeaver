from anomalib.engine import Engine
from anomalib.models import Patchcore
from anomalib.data import PredictDataset
from pathlib import Path
import json
import numpy as np
from skimage.segmentation import mark_boundaries

from inference_utils import save_prediction_outputs

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
