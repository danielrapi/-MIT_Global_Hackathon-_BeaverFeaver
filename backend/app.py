from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
import os
import base64
from process_pipeline import run_pipeline

app = FastAPI(title="Anomaly Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR = Path("inference_outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

def encode_image_to_base64(image_path: Path) -> str:
    """Convert image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

@app.post("/upload_image")
async def upload_image(file: UploadFile = File(None), image: UploadFile = File(None)):
    """
    Upload an image file for anomaly detection and analysis.
    Accepts either 'file' or 'image' as the field name.
    """
    try:
        # Get the uploaded file (either from 'file' or 'image' field)
        uploaded_file = file or image
        if not uploaded_file:
            return {"error": "No file uploaded"}
        print(f"🔍 Uploading image: {uploaded_file.filename}")
        # Generate a unique filename
        file_extension = os.path.splitext(uploaded_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename

        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)

        # Process the image through the pipeline
        print(f"Processing image: {file_path}")
        results = run_pipeline(file_path, str(OUTPUT_DIR / unique_filename))
        
        if not results:
            return {
                "error": "No results generated from pipeline",
                "filename": unique_filename
            }
            
        # Get the first result (since we're processing one image)
        result = results[0]
        
        # Encode images as base64
        mask_base64 = encode_image_to_base64(Path(result["mask_path"]))
        heatmap_base64 = encode_image_to_base64(Path(result["heat_map_path"]))
        normal_base64 = encode_image_to_base64(Path(result["image_path"]))

        return {
            "message": "File processed successfully",
            "filename": unique_filename,
            "detection": result["json_summary"],
            "images": {
                "marked": f"data:image/png;base64,{mask_base64}",
                "heatmap": f"data:image/png;base64,{heatmap_base64}",
                "normal": f"data:image/png;base64,{normal_base64}"
            }
        }
                
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

