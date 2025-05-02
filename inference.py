from anomalib.engine import Engine
from anomalib.models import Patchcore
from anomalib.data import PredictDataset
from pathlib import Path
import torch

# Wrap the execution code in if __name__ == "__main__" to prevent multiprocessing issues
if __name__ == "__main__":
    # Initialize the engine
    engine = Engine()
    
    # Create the prediction dataset
    # Use proper parameters that are supported in the current Anomalib version
    dataset = PredictDataset(
        path=Path("datasets/drone/test"),
        # Transform will be applied by the model's preprocessor
    )
    
    # Load the trained model from checkpoint
    checkpoint_path = "results/Patchcore/drone/latest/weights/lightning/model.ckpt"
    
    # Ensure the checkpoint exists
    if not Path(checkpoint_path).exists():
        print(f"Error: Checkpoint not found at {checkpoint_path}")
        print("Make sure you've trained the model first and the path is correct.")
        exit(1)
    
    # Run inference
    model = Patchcore(
            backbone="resnet18",
            layers=["layer2", "layer3"],
            pre_trained=True,
            coreset_sampling_ratio=0.1,
            num_neighbors=9,
        )
    print(f"Running inference on images in datasets/drone/test")
    results = engine.predict(
        model=model,
        dataset=dataset,
        ckpt_path=checkpoint_path
    )
    
    # Display results
    print(f"Result type: {type(results)}")
    print(f"Number of results: {len(results)}")
    
    # Print predictions for each image
    for i, result in enumerate(results):
        print(f"\nImage {i+1}:")
        print(f"  - Filename: {result.image_path}")
        print(f"  - Predicted anomaly score: {result.pred_score.item():.4f}")
        print(f"  - Is anomalous: {'Yes' if result.pred_label == 1 else 'No'}")
