import base64
from openai import OpenAI
import argparse
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

load_dotenv()

class ImageAnalysis(BaseModel):
    general_description: str = Field(description="Short description of the image")
    main_objects: List[str] = Field(description="List of main objects detected in the image and position")
    
def encode_image(image_path):
    """Convert image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def annotate_picture(image_path):
    """Analyze thermal drone image and generate description using OpenAI."""
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is not set")
        return None

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    base64_image = encode_image(image_path)

    completion = client.chat.completions.create(
        model="gpt-4-vision-preview",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "This is a thermal image taken by a drone. Describe what you see in the image in one sentence. Do just output the description of the object, no other text. Describe any single object (bus, human, etc.)"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
    )

    response_message = completion.choices[0].message.content
    print(response_message)

def main():
    parser = argparse.ArgumentParser(description="Analyze thermal drone images")
    parser.add_argument("--image_path", type=str, required=True, help="Path to the thermal image")
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