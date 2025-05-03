import base64
from openai import OpenAI
import argparse
import os
from dotenv import load_dotenv

load_dotenv()

def encode_image(image_path: str) -> str:
    """Convert image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def get_prompt() -> str:
    """Return the analysis prompt for the LLM."""
    return """
You are an AI assistant helping to annotate drone surveillance images. You will be shown a drone-captured image with bounding boxes already drawn on it, highlighting regions flagged as anomalous by an unsupervised detection model. These anomalies are not yet classified — your task is to describe what is in and around each box, and interpret the scene holistically.

Please analyze the drone image and return a structured JSON response with the following fields:

{
  "scene_description": "<Brief natural language summary of the scene including all objects, especially those in boxes. Necessary information only. Don't mention added details like anomaly boxes and focus on objects (don't mention weather or other details).>",
  "anomalies": [
    {
      "box_id": 1,
      "approximate_location": "bottom-left",
      "possible_objects": ["person", "motorbike"],
      "object_confidences": {"person": 0.82, "motorbike": 0.40},
      "notable_features": "Standing alone on an empty road",
      "anomaly_reasoning": "Unusual presence of person in area with no other human activity"
    },
    ...
  ],
  "overall_objects_detected": [
    {"label": "car", "count": 4},
    {"label": "person", "count": 2}
  ],
  "environment": {
    "time_of_day": "day/night/unclear",
    "location_type": "urban/rural/forest/industrial/other"
  }
}

Guidelines:
- Focus on what appears inside and around the anomaly boxes.
- Estimate positions in terms like 'top-left', 'center', 'bottom-right'.
- If unsure of an object, suggest plausible options with lower confidence.
- Use probabilities between 0 and 1 for object confidence scores.
"""

def annotate_picture(image_path: str):
    """Analyze drone image with bounding boxes and return structured annotation."""
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is not set")
        return

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    base64_image = encode_image(image_path)
    prompt_text = get_prompt()

    completion = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=1500,
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
    print(response_message)

def main():
    parser = argparse.ArgumentParser(description="Analyze drone images with anomaly bounding boxes")
    parser.add_argument("--image_path", type=str, required=True, help="Path to the annotated drone image")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Image file '{args.image_path}' not found")
        return

    try:
        annotate_picture(args.image_path)
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")

if __name__ == "__main__":
    main()
