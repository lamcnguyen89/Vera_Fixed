# USAGE
# python faceRecognition.py --encodings encodings.pickle --input videos/gameplay.mp4 --gazepoint gp_data/gp.csv
# if a local /videos/ folder already exists in the directory it must be deleted first

# import the necessary packages
import face_recognition
import numpy as np
import argparse
import imutils
import pickle
import time
import cv2
import eye_process as ep
import vimeo
import vimeo_dl as vim
import sys
import eye_process as ep
import os
import time
import shutil
import datetime


def linkSearch(videoUri):
    docs = v.get('/me/videos', params={"fields": "data, uri, link, name"})
    link = 'none'
    name = 'none'
    for video in docs.json()['data']:
        if video['uri'] == videoUri:
            link = video['link']
            name = video['name'] + '.mp4'
    return link, name

v = vimeo.VimeoClient(
    token = '4900cbf99d233eec00ae8a9852efbbd2',
    key = '5bdcef49d7de49605889b090e8be17397b1a38a5',
    secret = 'WRdVugFq8S+8zCBvbvOfG6J/tsZfYNASm00T6oprJvaywkfwUuO+3zBwwaobPgnipAdmh35O2/m6kGy6wt4E/foNMYgStw8z5giWuQWvTbZLQhJCzxnwxRDguD+NR69m'
)

# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-e", "--encodings", required=True, help="path to serialized db of facial encodings")
ap.add_argument("-i", "--input", required=True, help="path to input video")
ap.add_argument("-g", "--gazepoint", required=True, help="path to gazepoint data")
ap.add_argument("-y", "--display", type=int, default=1, help="whether or not to display output frame to screen")
ap.add_argument("-d", "--detection-method", type=str, default="hog", help="face detection model to use: either `hog` or `cnn`")
args = vars(ap.parse_args())

print(args["gazepoint"])

WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720

faceCascade = cv2.CascadeClassifier('haarCascade/haarcascade_frontalface_default.xml') # import the haar cascade


# Number of frames that are edited from the original video
offset = 57360

# load the known faces and embeddings
print("[INFO] loading encodings...")
data = pickle.loads(open(args["encodings"], "rb").read())

if not os.path.exists('./videos'):
	os.mkdir('videos')
# initialize the pointer to the video file and the video writer
videoLink, videoName =  linkSearch(args["input"])
bestVidRes = vim.new(videoLink).getbest()
bestVidRes.download(quiet=False)
shutil.move(videoName, './videos')

print("[INFO] processing video...")
stream = cv2.VideoCapture('./videos/' + videoName)
videoNameOld = videoName
videoName = videoName[:-4] + '_gp'

eye_points = ep.process_eye_data(args["gazepoint"], WINDOW_WIDTH, WINDOW_HEIGHT)
is_looking = ep.is_looking()
print(eye_points.shape)
print(len(is_looking))

result = cv2.VideoWriter('./videos/' + videoName + '.avi',  
                         cv2.VideoWriter_fourcc(*'MJPG'), 
                         25, (WINDOW_WIDTH, WINDOW_HEIGHT)) 

n = 0
secondsLooked = {}
past = datetime.datetime.now()
# loop over frames from the video file stream
while True:
	n += 1
	print('processing frame #', n)
	# grab the next frame
	grabbed, frame = stream.read()

	if grabbed == False:
		break;

	# convert the input frame from BGR to RGB then resize it to have
	# a width of 750px (to speedup processing)
	rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
	rgb = imutils.resize(frame, width=750)
	r = frame.shape[1] / float(rgb.shape[1])

	# Used to reference the desired point in the gazepoint csv
	time_passed = int(stream.get(cv2.CAP_PROP_POS_FRAMES)) #+ offset

	# How far from the central circle should the peripheral eye tracking circles be drawn.
	distance = 75

	# Draw circles where the user is looking based on eye tracking data.
	if (is_looking[time_passed]):
		# Central circle at the exact position the user is looking at.
		cv2.circle(frame, (eye_points[0][time_passed], eye_points[1][time_passed]), 10, (255,0,255), thickness = 2)
		# Circles drawn at cardinal points. (Order: East, West, North, South)
		cv2.circle(frame, (eye_points[0][time_passed] + distance, eye_points[1][time_passed]), 3, (100, 0, 100), thickness = 1)
		cv2.circle(frame, (eye_points[0][time_passed] - distance, eye_points[1][time_passed]), 3, (100, 0, 100), thickness = 1)
		cv2.circle(frame, (eye_points[0][time_passed], eye_points[1][time_passed] + distance), 3, (100, 0, 100), thickness = 1)
		cv2.circle(frame, (eye_points[0][time_passed], eye_points[1][time_passed] - distance), 3, (100, 0, 100), thickness = 1)
		# Circles drawn at intercardinal points. (Order: Northeast, Southeast, Northwest, Southwest) 
		cv2.circle(frame, ((int)(eye_points[0][time_passed] + distance / 2), (int)(eye_points[1][time_passed] + distance / 2)), 3, (100, 0, 100), thickness = 1)
		cv2.circle(frame, ((int)(eye_points[0][time_passed] + distance / 2), (int)(eye_points[1][time_passed] - distance / 2)), 3, (100, 0, 100), thickness = 1)
		cv2.circle(frame, ((int)(eye_points[0][time_passed] - distance / 2), (int)(eye_points[1][time_passed] + distance / 2)), 3, (100, 0, 100), thickness = 1)
		cv2.circle(frame, ((int)(eye_points[0][time_passed] - distance / 2), (int)(eye_points[1][time_passed] - distance / 2)), 3, (100, 0, 100), thickness = 1)

	# detect the (x, y)-coordinates of the bounding boxes
	# corresponding to each face in the input frame, then compute
	# the facial embeddings for each face
	boxes = face_recognition.face_locations(rgb,
		model=args["detection_method"])
	encodings = face_recognition.face_encodings(rgb, boxes)
	names = []

	gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

	faces = faceCascade.detectMultiScale(
        gray,

        # This property sets the speed of the video.
        # Default value: 1.15
        scaleFactor = 1.15,

        # Since this algorithm uses KNN, we train the model with enough
        # neighbors, More neighbors means better results.
        # Default value: 14
        minNeighbors = 14,

        # Size
        # Default value: (40, 40)
        minSize = (40, 40)
    )

	# loop over the facial embeddings
	for encoding in encodings:
		# attempt to match each face in the input image to our known
		# encodings
		matches = face_recognition.compare_faces(data["encodings"],
			encoding)
		name = "Unknown"

		# check to see if we have found a match
		if True in matches:
			# find the indexes of all matched faces then initialize a
			# dictionary to count the total number of times each face
			# was matched
			matchedIdxs = [i for (i, b) in enumerate(matches) if b]
			counts = {}

			# loop over the matched indexes and maintain a count for
			# each recognized face face
			for i in matchedIdxs:
				name = data["names"][i]
				counts[name] = counts.get(name, 0) + 1

			# determine the recognized face with the largest number
			# of votes (note: in the event of an unlikely tie Python
			# will select first entry in the dictionary)
			name = max(counts, key=counts.get)
		
		# update the list of names
		names.append(name)

	# loop over the recognized faces
	for ((top, right, bottom, left), name) in zip(faces, names):

		topRight = "%s, %s" % (top+bottom, right)
		bottomLeft = "%s, %s" % (top, right+left)
		look = ep.in_box(top, right, bottom, left, distance, eye_points[0][time_passed], eye_points[1][time_passed])

		# draw the predicted face name on the image
		# The rectangle drawn will be purple if the user's gaze is close to it, otherwise it will be green.

		if not secondsLooked.__contains__(name):
			secondsLooked[name] = 0

		if (look == 'Looking'):
			# start = 1
			cv2.rectangle(frame, (top, right), (top + bottom, right + left), (255, 0, 255), 2)

			secondsLooked[name] += 1
		else:
			cv2.rectangle(frame, (top, right), (top + bottom, right + left), (0, 255, 0), 2)
		y = top - 15 if top - 15 > 15 else top + 15

		nameAndSecs = str(secondsLooked[name])

		cv2.putText(frame, nameAndSecs, (top + bottom, right + 30 + left), cv2.FONT_HERSHEY_SIMPLEX,
			0.75, (255, 0, 255), 2)
		cv2.putText(frame, name, (top, right - 10), cv2.FONT_HERSHEY_SIMPLEX,
			0.75, (0, 255, 0), 2)
		
		# print top right coordinates
		cv2.putText(frame, topRight, (top + bottom, right), cv2.FONT_HERSHEY_SIMPLEX,
			0.75, (0, 255, 0), 2)
		
		# print bottom left coordinates
		cv2.putText(frame, bottomLeft, (top, right + 30 + left), cv2.FONT_HERSHEY_SIMPLEX,
			0.75, (0, 255, 0), 2)

	# cv2.imshow("Frame", frame)
	result.write(frame)
	key = cv2.waitKey(1) & 0xFF

	# if the `q` key was pressed, break from the loop
	if key == ord("q"):
		break

# close the video file pointers
print('Model finished')
result.release()
stream.release()

if os.path.exists("./videos/" + videoName + ".avi"):
	print('Uploading to vimeo...')
	video_uri = v.upload(
		"./videos/" + videoName + ".avi",
		data = {'name': videoName}
	)
	print('File successfully uploaded to vimeo!')
else:
  print("The file does not exist")

now = datetime.datetime.now()

print('Process started at ', past.strftime("%Y-%m-%d %H:%M:%S"))
print('Process ended at ', now.strftime("%Y-%m-%d %H:%M:%S"))
time.sleep(120)
os.remove("./videos/" + videoName + ".avi")	
os.remove("./videos/" + videoNameOld)

print('Script and Cleanup Done!')