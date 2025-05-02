import piexif
from PIL import Image
import random
import os

def deg_to_dms_rational(deg_float):
    deg = int(deg_float)
    min_float = (deg_float - deg) * 60
    min_int = int(min_float)
    sec_float = round((min_float - min_int) * 60 * 10000)
    return [(deg, 1), (min_int, 1), (sec_float, 10000)]

def write_gps_exif(image_path, lat, lon, altitude=100.0):
    lat_ref = 'N' if lat >= 0 else 'S'
    lon_ref = 'E' if lon >= 0 else 'W'
    lat_dms = deg_to_dms_rational(abs(lat))
    lon_dms = deg_to_dms_rational(abs(lon))

    zeroth_ifd = {}
    exif_ifd = {}
    gps_ifd = {
        piexif.GPSIFD.GPSLatitudeRef: lat_ref,
        piexif.GPSIFD.GPSLatitude: lat_dms,
        piexif.GPSIFD.GPSLongitudeRef: lon_ref,
        piexif.GPSIFD.GPSLongitude: lon_dms,
        piexif.GPSIFD.GPSAltitude: (int(altitude * 100), 100),
        piexif.GPSIFD.GPSAltitudeRef: 0,
    }

    exif_dict = {"0th": zeroth_ifd, "Exif": exif_ifd, "GPS": gps_ifd}
    exif_bytes = piexif.dump(exif_dict)

    img = Image.open(image_path)
    img.save(image_path, exif=exif_bytes)

# Apply to all JPGs in a folder
def add_fake_exif_to_folder(folder):
    for file in os.listdir(folder):
        if file.lower().endswith(".jpg"):
            lat = random.uniform(47.6, 48.5)
            lon = random.uniform(7.5, 8.5)
            path = os.path.join(folder, file)
            write_gps_exif(path, lat, lon)
            print(f"✔️ Added EXIF to {file} → ({lat:.5f}, {lon:.5f})")

# Usage
add_fake_exif_to_folder("data/test/abnormal")
