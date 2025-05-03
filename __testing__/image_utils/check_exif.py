from PIL import Image
import piexif

img = Image.open("data/train/DJI_M300_H20t_0001.jpg")
exif_dict = piexif.load(img.info["exif"])

# Print GPS data
gps = exif_dict.get("GPS")
if gps:
    print("GPS data found:")
    for tag in gps:
        print(piexif.TAGS["GPS"][tag]["name"], gps[tag])
else:
    print("No GPS data found.")
