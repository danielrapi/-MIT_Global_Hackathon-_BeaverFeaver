from PIL import Image
import piexif
import random

def dms_to_deg(dms, ref):
    """Convert EXIF GPS coordinates to decimal degrees."""
    degrees = dms[0][0] / dms[0][1]
    minutes = dms[1][0] / dms[1][1]
    seconds = dms[2][0] / dms[2][1] / 60
    decimal = degrees + minutes / 60 + seconds
    if ref in ['S', 'W']:
        decimal *= -1
    return decimal

def extract_gps_from_exif_or_generate(image_path: str) -> tuple[float, float]:
    """Extract GPS coordinates from EXIF or generate synthetic ones."""
    try:
        img = Image.open(image_path)
        exif_data = img.info.get("exif")
        if exif_data:
            exif_dict = piexif.load(exif_data)
            gps_info = exif_dict.get("GPS", {})

            if piexif.GPSIFD.GPSLatitude in gps_info and piexif.GPSIFD.GPSLongitude in gps_info:
                lat = dms_to_deg(gps_info[piexif.GPSIFD.GPSLatitude], gps_info[piexif.GPSIFD.GPSLatitudeRef].decode())
                lon = dms_to_deg(gps_info[piexif.GPSIFD.GPSLongitude], gps_info[piexif.GPSIFD.GPSLongitudeRef].decode())
                return lat, lon
    except Exception as e:
        print(f"⚠️ Could not extract EXIF from {image_path}: {e}")

    # Generate fake GPS if EXIF missing or invalid
    lat = random.uniform(47.887088, 47.909797)
    lon = random.uniform(7.774913, 7.815842)
    return lat, lon
