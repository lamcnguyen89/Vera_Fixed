# A program that creates a trained model using LBPH computing.
# It should be ran after facial data is collected by running  
# "faceDataset.py" on your face training data. 
#   - Each face should have a unique integer ID stored in 'dataset/'.
#   - The trained model will be stored in 'trainer/'; if this
#     folder does not exist, you should create it.

import cv2
import numpy as np
from PIL import Image
import os 
import sys

# Installations 
#   PIL:   "pip install pillow"
#   numpy: "pip install numpy"
#   cv2:   "pip install opencv-python"
#   cmake: "pip install cmake"
#   dlib:  "pip install dlib"

# Path for the face images database
path = 'dataset'

recognizer = cv2.face.LBPHFaceRecognizer_create()
detector = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

# Function to get the images and label data
def getImagesAndLabels(path):
    imagePaths = [os.path.join(path, f) for f in os.listdir(path)]
    print(imagePaths)
    faceSamples = []
    ids = []

    for imagePath in imagePaths:
        # Convert image to grayscale
        PILImg = Image.open(imagePath).convert('L')
        imgNumpy = np.array(PILImg, 'uint8')

        # Get the unique face id
        id = int(os.path.split(imagePath)[-1].split(".")[1])
        faces = detector.detectMultiScale(imgNumpy)

        for (x, y, w, h) in faces:
            faceSamples.append(imgNumpy[y:y+h,x:x+w])
            ids.append(id)

    return faceSamples, ids

print("\n Training faces. It will take a few seconds. Wait...")
faces, ids = getImagesAndLabels(path)
recognizer.train(faces, np.array(ids))

# Save the model into the trainer/trainer.yml
recognizer.write('trainer/trainer.yml')

# Print the number of different faces or characters and end the program
print("\n {0} faces trained. Exiting program".format(len(np.unique(ids))))