import os
import json
from pathlib import Path
from typing import Dict, List
from annotate_single_picture import encode_image, get_prompt, AnalysisResult
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def get_images_to_process(masks_dir: str, json_dir: str) -> List[str]:
    """Get list of images that have pred_label = 1 in their corresponding JSON files."""
    image_files = []
    
    # Get all JSON files
    json_files = [f for f in os.listdir(json_dir) if f.endswith('.json')]
    
    for json_file in json_files:
        try:
            # Read the JSON file
            with open(os.path.join(json_dir, json_file), 'r') as f:
                data = json.load(f)
            
            # Check if pred_label is 1
            if data.get('pred_label') == 1:
                # Get corresponding image filename (replace .json with .png)
                image_file = json_file.replace('_summary.json', '_mask.png')
                image_path = os.path.join(masks_dir, image_file)
                print(image_path)
                # Check if the image exists
                if os.path.exists(image_path):
                    image_files.append(image_file)
                else:
                    print(f"Warning: Image {image_file} not found in masks directory")
                    
        except Exception as e:
            print(f"Error processing {json_file}: {str(e)}")
            continue
    return image_files

def process_directory(masks_dir: str, json_dir: str) -> Dict[str, AnalysisResult]:
    """Process images that have pred_label = 1 in their JSON files."""
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is not set")
        return {}

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    results: Dict[str, AnalysisResult] = {}
    
    # Get list of images to process
    image_files = get_images_to_process(masks_dir, json_dir)
    print(f"Found {len(image_files)} images with pred_label = 1 to process")
    
    for idx, image_file in enumerate(image_files, 1):
        print(f"Processing image {idx}/{len(image_files)}: {image_file}")
        
        try:
            image_path = os.path.join(masks_dir, image_file)
            base64_image = encode_image(image_path)
            prompt_text = get_prompt()

            completion = client.chat.completions.create(
                model="gpt-4o",
                max_tokens=1500,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_text},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ]
            )

            response_message = completion.choices[0].message.content
            results[image_file] = json.loads(response_message)
            
        except Exception as e:
            print(f"Error processing {image_file}: {str(e)}")
            continue

    return results

def save_results(results: Dict[str, AnalysisResult], output_path: str):
    """Save the results to a JSON file."""
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Results saved to {output_path}")

def main():
    # Define paths
    masks_dir = "inference_outputs/masks"
    json_dir = "inference_outputs/json"
    output_file = "annotations_v2.json"
    
    # Check if directories exist
    if not os.path.exists(masks_dir):
        print(f"Error: Directory '{masks_dir}' not found")
        return
    if not os.path.exists(json_dir):
        print(f"Error: Directory '{json_dir}' not found")
        return

    try:
        results = process_directory(masks_dir, json_dir)
        if results:
            save_results(results, output_file)
            print(f"Successfully processed {len(results)} images")
        else:
            print("No results were generated")
    except Exception as e:
        print(f"Error in batch processing: {str(e)}")

if __name__ == "__main__":
    main() 