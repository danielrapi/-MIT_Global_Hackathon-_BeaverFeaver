import torch
import multiprocessing
from anomalib.models import Patchcore
from anomalib.engine import Engine
from anomalib.data import Folder

# === Dataset Setup ===
# Create transforms for training
# train_transform = transforms.Compose([
#     transforms.Resize((256, 256)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # ImageNet normalization
# ])

# Force spawn method for macOS
if __name__ == "__main__":
    # Set multiprocessing start method to 'spawn' for macOS
    multiprocessing.set_start_method('spawn', force=True)
    
    # Set number of threads for OpenMP
    torch.set_num_threads(1)
    
    print("Starting PatchCore training...")
    
    try:
        # Create datamodule with custom transforms
        datamodule = Folder(
            name="drone",
            root="datasets/drone",
            normal_dir="train",
            abnormal_dir="test/bad",
            normal_test_dir="test/good",
            # train_augmentations=train_transform  # Use train_augmentations instead of transform
        )
        datamodule.setup()
        print("Datamodule setup complete")

        # === PatchCore Setup ===
        model = Patchcore(
            backbone="resnet18",
            layers=["layer2", "layer3"],
            pre_trained=True,
            coreset_sampling_ratio=0.1,
            num_neighbors=9,
        )
        print("Model created")

        # === Engine Setup and Training ===
        engine = Engine()
        print("Starting training...")
        engine.fit(model=model, datamodule=datamodule)
        print("Training complete")
        print("Model saved to: results/Patchcore/drone/latest/weights/lightning/model.ckpt")
    except Exception as e:
        print(f"Error during training: {e}")
