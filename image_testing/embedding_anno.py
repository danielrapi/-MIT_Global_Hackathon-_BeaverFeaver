import os
import json
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

json_dir = Path("inference_outputs/json")

def extract_text(annotation: dict) -> str:
    """Format the annotation into a string to embed."""
    parts = [annotation.get("scene_description", "")]
    for anomaly in annotation.get("anomalies", []):
        reasoning = anomaly.get("anomaly_reasoning", "")
        parts.append(reasoning)
    return " ".join(parts).strip()

for file in json_dir.glob("*.json"):
    with open(file, "r") as f:
        data = json.load(f)

    llm_annotation = data.get("annotation")
    if not llm_annotation:
        continue

    text = extract_text(llm_annotation)
    if not text.strip():
        continue

    print(f"Embedding: {file.name} ...")
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",  # "text-embedding-ada-002"
            input=text
        )
        embedding = response.data[0].embedding
        data["embedding"] = embedding

        with open(file, "w") as f:
            json.dump(data, f, indent=2)

    except Exception as e:
        print(f"❌ Failed to embed {file.name}: {e}")
