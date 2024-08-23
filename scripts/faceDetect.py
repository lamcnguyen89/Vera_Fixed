import numpy as np
import cv2
import sys
import os
import eye_process as ep

# Specify resolution of video you are working with.
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720
# *******************Please Read*****************************************

# This version requires to have some dependencies like numpy, cv2, cmake, and dlib. The other dependencies 'sys' and 'os'
# already come pre-installed on your machine.
# Also this script has been tested and runned on a Anaconda environment, so if you have any issues
# make sure to run it in Anaconda. You can find the link below.

# If you need any of these dependencies you can find the download command below
# ----- Anaconda: https://www.anaconda.com/products/individual
# ----- numpy: "pip install numpy"
# ----- cv2: "pip install opencv-python"
# ----- cmake: "pip install cmake"
# ----- dlib: "pip install dlib" (may take a couple of minutes to install)


# This face detector uses a haar cascade to detect different faces, please make sure to have the 
# haar cascade file in the same directory as this python script, otherwise this will not work.
# The haar cascade file will be available along with this file so everything should work out of the box :)

# You can pass your video as a command line argument like so:
# 'python faceDetect.py <Path_To_Your_Video_File>' 
# or substitute the path with a 0 to use your webcam.

# ****************************************************************************

# Just checking that a command line argument as been provided and that the file actually exists.
if len(sys.argv) <= 2:
    sys.exit("Please include the path of the video file and csv file!")
elif (os.path.isfile(sys.argv[1]) is False) or (os.path.isfile(sys.argv[2] is False)):
    sys.exit('File does not exist, make sure you typed the right path!')
else:
    path = sys.argv[1]
    path2 = sys.argv[2]
    print('Files Exist!\nOpening {0} and {1}'.format(sys.argv[1], sys.argv[2]))

faceCascade = cv2.CascadeClassifier('haarCascade/haarcascade_frontalface_default.xml') # import the haar cascade

cap = cv2.VideoCapture(path) # import video
cap.set(3, 640) # set Width
cap.set(4, 480) # set Height

eye_points = ep.process_eye_data(path2, WINDOW_WIDTH, WINDOW_HEIGHT)
is_looking = ep.is_looking()
print(eye_points.shape)
print(len(is_looking))

while True:

    # Capture every frame from the video
    ret, frame = cap.read()

    time_passed = int(cap.get(cv2.CAP_PROP_POS_FRAMES))

    if (is_looking[time_passed]):
        cv2.circle(frame, (eye_points[0][time_passed], eye_points[1][time_passed]), 10, (255, 0, 255), thickness = 2)

    # This sets every frame to grayscale so the algorithm can detect faces
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Face detection properties
    # These properties migh change from system to system,
    # you can play around with the values to find your perfect settings.
    faces = faceCascade.detectMultiScale(
        gray,

        # This property sets the speed of the video.
        # Default value: 1.15
        scaleFactor = 3,

        # Since this algorithm uses KNN, we train the model with enough
        # neighbors, More neighbors means better results.
        # Default value: 14
        minNeighbors = 5,

        # Size
        # Default value: (40, 40)
        minSize = (40, 40)
    )

    for (x, y, w, h) in faces:
        
        # Coordinate variables
        topRight = "%s, %s" % (x+w, y)
        bottomLeft = "%s, %s" % (x, y+h)
        bottomRight = ep.in_box(x, y, w, h, eye_points[0][time_passed], eye_points[1][time_passed])
        
        # Draw rectangle around character
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        
        # Print top right coordinates
        cv2.putText(frame, topRight, (x+w, y), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 1, (255, 255, 255), 2)
        
        # Print bottom left coordinates
        cv2.putText(frame, bottomLeft, (x, y+30+h), cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 1, (255, 255, 255), 2)

        # Prints if the user is looking the box or not.
        if (bottomRight == 'Looking'):
            cv2.putText(frame, bottomRight, (0,25), cv2.FONT_ITALIC, 1, (255, 255, 0), 2)
        else:
            cv2.putText(frame, bottomRight, (0,25), cv2.FONT_ITALIC, 1, (0, 255, 255), 2)
        
    # Show video
    cv2.imshow('video', frame)
    
    # Press 'q' to terminate the video early
    # otherwise it will continue until finished.
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# kill video and cleaning up.
cap.release()
cv2.destroyAllWindows()
