# A program that performs real time facial recognition.
# This program is meant to be ran after "faceDataset.py" and "faceTraining.py"
#   Each face stored in 'dataset/' should have a unique integer ID as an identifier
#   LBPH computed model (trained faces) should be in 'trainer/'
# If either of these directories do not exist they should be added to the current 
# directory before running "faceDataset.py" and "faceTraining.py" 

import numpy as np
import cv2
import sys
import os
import json

# Installations
#   numpy: "pip install numpy"
#   cv2:   "pip install opencv-python"
#   cmake: "pip install cmake"
#   dlib:  "pip install dlib"
# Run the program using the following format: "python faceRecoginition.py video.mp4"

# Just checking that a command line argument as been provided and that the file actually exists.
if len(sys.argv) <= 1:
    sys.exit("Please include the path of the video file, or type 0 to use your webcam!")
elif sys.argv[1] == '0':
    path = 0
    print('Using webcam as video feed...') 
elif os.path.isfile(sys.argv[1]) is False:
    sys.exit('File does not exist, make sure you typed the right path!')
else:
    path = sys.argv[1]
    print('File Exists!\nOpening %s...' % sys.argv[1])

# id counter
id = 0

# Character names related to ID's
names = ['Unknown', 'Bigby', 'Woodsman', 'Faith', 'Beauty', 'Grimble',
         'Beast', 'Snow', 'Cryer', 'Grendel', 'Ichabod', 'Magic Mirror']


cascPath = "haarcascade_frontalface_default.xml"
faceDetector = cv2.CascadeClassifier(cascPath) # import the haar cascade

# Intialize and start video
cam = cv2.VideoCapture(path) # import video
cam.set(3, 640)  # set Width
cam.set(4, 480)  # set Height

recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read('trainer/trainer.yml')

minW = 0.1 * cam.get(3)
minH = 0.1 * cam.get(4)

while True:

    # Capture every frame from the video
    ret, img = cam.read()

    # This sets every frame to grayscale so the algorithm can detect faces
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Face detection properties
    # These properties migh change from system to system,
    # you can play around with the values to find your perfect settings.
    faces = faceDetector.detectMultiScale(
        gray,

        # This property sets the speed of the video.
        # Default value: 1.15
        scaleFactor=1.15,

        # Since this algorithm uses KNN, we train the model with enough
        # neighbors, More neighbors means better results.
        # Default value: 14
        minNeighbors=14,

        # Size
        # Default value: (40, 40)
        minSize=(int(minW), int(minH))
    )

    topRight = 0
    bottomLeft = 0

    for (x, y, w, h) in faces:

        # Coordinate variables
        topRight = "%s, %s" % (x+w, y) # (x, y) -> (x+w, y)
        bottomLeft = "%s, %s" % (x, y+h) # (x, y) -> (x, y+h)
        
        # Draw rectangle around character
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)

        # Print top right coordinates
        cv2.putText(img, topRight, (x+w, y), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 1, (255, 255, 255), 2)
        
        # Print bottom left coordinates
        cv2.putText(img, bottomLeft, (x, y+30+h), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 1, (255, 255, 255), 2)

        id, confidence = recognizer.predict(gray[y:y+h,x:x+w])
        
        # Check if the confidence is less than 100 -> 0 would be a perfect match
        if (confidence < 100):
            id = names[id]
            confidence = "  {0}%".format(round(100 - confidence))
        else:
            id = "unknown"
            confidence = "  {0}%".format(round(100 - confidence))

        # Print the character's unique ID
        cv2.putText(img, str(id), (x-w,y), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 2)
        
        # Print the confidence level
        cv2.putText(img, str(confidence), (x-w, y+15), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, .5, (255, 255, 255), 2)    

    # Show the changes on the video
    cv2.imshow('video', img)

    k = cv2.waitKey(10) & 0xff # Press 'ESC' for exiting video
    if k == 27:
        break

# Kill video and clean up
cam.release()
cv2.destroyAllWindows()