# Thermal Anomaly Detection System

## Overview
This project is a thermal anomaly detection system developed during the MIT Global Hackathon. It uses machine learning to identify anomalies in thermal drone imagery, with a focus on detecting humans and animals in search and rescue scenarios.

## Features
- **Anomaly Detection**: Uses Patchcore model to identify unusual patterns in thermal images
- **LLM-Powered Analysis**: Leverages GPT-4o-mini to interpret thermal anomalies and identify potential humans/animals
- **Geospatial Integration**: Extracts GPS data from image EXIF or generates placeholder coordinates
- **Vector Embeddings**: Creates embeddings of annotations for similarity search
- **API Backend**: FastAPI server for image upload and processing
- **Visualization**: Generates heatmaps and segmentation masks for detected anomalies

## Technical Architecture
The system consists of several components:
- **Anomaly Detection Engine**: Based on Anomalib's Patchcore implementation
- **Processing Pipeline**: Coordinates the workflow from image input to final analysis
- **LLM Integration**: Uses OpenAI's API to analyze thermal signatures
- **Backend API**: Provides endpoints for image upload and processing

## Getting Started

### Prerequisites
- Python 3.8+
- OpenAI API key
- Required Python packages (see requirements.txt)

### Installation
1. Clone the repository