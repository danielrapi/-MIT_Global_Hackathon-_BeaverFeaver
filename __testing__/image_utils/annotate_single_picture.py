import base64
from openai import OpenAI
import argparse
import os
from dotenv import load_dotenv
from typing import List, Dict, TypedDict, Optional
import json

load_dotenv()

class Anomaly(TypedDict):
    box_id: int
    approximate_location: str
    possible_objects: List[str]
    object_confidences: Dict[str, float]
    notable_features: str
    anomaly_reasoning: str

class Environment(TypedDict):
    time_of_day: str
    location_type: str

class ObjectCount(TypedDict):
    label: str
    count: int

class AnalysisResult(TypedDict):
    scene_description: str
    anomalies: List[Anomaly]
    overall_objects_detected: List[ObjectCount]
    environment: Environment

def encode_image(image_path: str) -> str:
    """Convert image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def get_prompt() -> str:
    """Return the analysis prompt for the LLM."""
    return """
        You are an AI assistant supporting search and rescue operations by analyzing thermal drone images captured from a top-down aerial perspective. Each image includes bounding boxes around regions flagged as anomalous by an unsupervised detection model. These anomalies are not yet classified.

        Your task is to:

        * Describe what is visible within and directly around each anomaly box, with a strong emphasis on identifying potential humans or animals.
        * Interpret the objects and shapes in the full image based on thermal signatures and spatial layout.
        * Pay close attention to size, shape, orientation, and temperature contrast of objects, as they appear from a thermal, top-down view. Standing humans may appear as vertically narrow but strongly contrasted shapes.
        * The image contains only thermal information — no color or texture details.

        Important Guidelines:
        * Never declare that no person or animal is present unless you are absolutely certain.
        * If any heat signature, shape, or outline could plausibly belong to a human or animal, include it as a possible_object with a reasonable confidence score.
        * Do not use generic terms like “heat source.” Be specific and name plausible real-world objects such as "person", "animal", "vehicle", or "debris" — even if the confidence is low.
        * Confidence scores must be between 0.0 and 1.0, where 1.0 means certain identification.
        * Do not speculate about the broader scene context (e.g., “abandoned,” “active”) — focus only on what can be directly inferred from thermal shapes and intensities.

        Output Format:
        Return a single valid JSON object with the following fields:

        {
        "scene_description": "List of visible objects across the entire image with their thermal and spatial attributes. Do not make assumptions. Only state that no humans or animals are seen if absolutely certain. Mention if something is potentially a human or animal. Never say 'heat source' — instead describe what it may plausibly be. Never just describe the environment, always describe the objects.",
        "anomalies": [
            {
            "box_id": 1,
            "approximate_location": "bottom-right",
            "possible_objects": ["person", "animal", "logs", "debris", "vehicle", "tree", "other"],
            "object_confidences": {"person": 0.75, "animal": 0.52, "logs": 0.25, "debris": 0.10, "vehicle": 0.30, "tree": 0.15, "other": 0.05},
            "notable_features": "Small, vertically-oriented thermal signature with clear contrast against background",
            "anomaly_reasoning": "Thermal intensity and shape are consistent with a standing or crouched person, possibly viewed from above"
            }
        ],
        "overall_objects_detected": [
            {"label": "vehicle", "count": 0},
            {"label": "person", "count": 0}
        ],
        "location_type": "forest/mountain/flat"
        }

        Additional Instructions:
        * Use directional terms like "top-left" or "center-right" for approximate_location.
        * The "scene_description" should only describe object types, approximate counts, positionings, and thermal characteristics (e.g., “One elongated warm signature near center, low thermal activity elsewhere”).
        * Include "person" in possible_objects even at low confidence if there is any visual feature that may plausibly indicate one.
        * Return only valid JSON — do not include any extra explanation or surrounding text.

"""

def annotate_picture(image_path: str) -> Optional[AnalysisResult]:
    """Analyze drone image with bounding boxes and return structured annotation."""
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is not set")
        return None

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
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

    try:
        response_message = completion.choices[0].message.content
        return json.loads(response_message)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Analyze drone images with anomaly bounding boxes")
    parser.add_argument("--image_path", type=str, required=True, help="Path to the annotated drone image")
    args = parser.parse_args()

    if not os.path.exists(args.image_path):
        print(f"Error: Image file '{args.image_path}' not found")
        return

    try:
        result = annotate_picture(args.image_path)
        if result:
            print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")

if __name__ == "__main__":
    main()
