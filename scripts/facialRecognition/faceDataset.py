# A program that takes a video of a person or character and classifies them
# by giving them a unique user ID that can later be used to identify them.
#   Each face should have a unique integer ID that should be stored in a folder 
#   'dataset/'; if this folder does not exist, it should be created

import numpy as np
import cv2
import sys
import os
import json

# Installations:
#   numpy: "pip install numpy"
#   cv2:   "pip install opencv-python"
#   cmake: "pip install cmake"
#   dlib:  "pip install dlib"
# Run the program using the following format: "python faceDataset.py example1.mp4"

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

cascPath = "haarcascade_frontalface_default.xml"
faceDetector = cv2.CascadeClassifier(cascPath) # import the haar cascade

cam = cv2.VideoCapture(path) # import video
cam.set(3, 640)  # set Width
cam.set(4, 480)  # set Height
    
# Input command to capture a user ID (should be an integer number)
faceId = input('\n Enter a user id and press enter ==> ')

# TODO: verify that user input is an integer 

frameNum = 0

while True:

    # Capture every frame from the video
    ret, img = cam.read()

    if img is not None:
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
            minSize=(40, 40)
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
            
            frameNum += 1

            # Save captured image to the dataset folder 
            cv2.imwrite("dataset/User." + str(faceId) + '.' + str(frameNum) + ".jpg", gray[y:y+h, x:x+w])

            cv2.imshow('image', img)

        # Create JSON object (Not being used for now)
        ################################################################################
        # if (topRight != 0 or bottomLeft != 0):
        #     foundFace = {
        #         "topRight": topRight,
        #         "bottomLeft": bottomLeft,
        #         'FrameNumber': frameNum
        #     }

        #     faceJson = json.dumps(foundFace, indent=4)


        #     with open("foundFaces/faceLocations.json", 'a') as outfile:
        #         outfile.write(faceJson + ',\n')
        #################################################################################

        # Show video
        cv2.imshow('video', img)

        # Press 'q' to terminate the video early
        # otherwise it will continue until finished.
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    else:
        # kill video and cleaning up.
        cam.release()
        cv2.destroyAllWindows()
        exit(1)

# Kill video and clean up
cam.release()
cv2.destroyAllWindows()

