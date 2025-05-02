import cv2
img = cv2.imread("data/train/DJI_M300_H20t_0001.jpg", cv2.IMREAD_GRAYSCALE)
img_rgb = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
cv2.imwrite("output.png", img_rgb)