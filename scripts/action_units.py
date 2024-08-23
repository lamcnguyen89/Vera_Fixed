import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from enum import Enum
import pymongo
import sys
from pymongo import MongoClient

# Enumeration of the boolean classes for better understanding
class Face(Enum):
    au_01 = 0  # Inner brow raiser
    au_02 = 1  # Outer brow raiser
    au_04 = 2  # Brow lowerer
    au_05 = 3  # Upper lid raiser
    au_06 = 4  # Cheek raiser
    au_07 = 5  # Lid tightener
    au_09 = 6  # Nose wrinkler
    au_10 = 7  # Upper lip raiser
    au_12 = 8  # Lip corner puller
    au_14 = 9  # Dimpler
    au_15 = 10 # Lip corner depressor
    au_17 = 11 # Chin raiser
    au_20 = 12 # Lip stretched
    au_23 = 13 # Lip tightener
    au_25 = 14 # Lips part
    au_26 = 15 # Jaw drop
    au_28 = 16 # Lip suck
    au_45 = 17 # Blink

client = MongoClient('mongodb://sherlock_dev:eJ69vujCfrs9k3@localhost:27017/?authSource=sherlock_dev&readPreference=primary&appname=MongoDB%20Compass&ssl=false')
db = client.sherlock_dev
upload = db["ml_out"]

data = pd.read_csv("au.csv")
uid = sys.argv[1]
frames = data.iloc[:, 0]
counter = 0
index = 0
final = 0
for column in data.columns:
    if (column == ' AU01_c'):
        index = counter
    if (column == ' AU45_c'):
        final = counter
    counter += 1

# Initialize the array of columns 
classes = []
while (index <= final):
    classes.append(data.iloc[:, index])
    index += 1

joy = [] # AUs: 6 + 12
sadness = [] # AUs: 1 + 4 + 15
surprise = [] # AUs: 1 + 2 + 5 + 6
fear = [] # AUs: 1 + 2 + 4 + 7 + 20 + 26
anger = [] # AUs: 4 + 5 + 7
contempt = [] # AUs: 12 + 14

for i in range(len(frames)):
    # Predict joy
    if (classes[Face.au_06.value][i] and classes[Face.au_12.value][i]):
        joy.append(True)
    else:
        joy.append(False)
        
    # Predict sadness
    if (classes[Face.au_01.value][i] and classes[Face.au_04.value][i] and classes[Face.au_15.value][i]):
        sadness.append(True)
    else:
        sadness.append(False)
    
    # Predict surprise
    if (classes[Face.au_01.value][i] and classes[Face.au_02.value][i] and classes[Face.au_05.value][i] 
        and classes[Face.au_06.value][i]):
        surprise.append(True)
    else:
        surprise.append(False)
    
    # Predict fear
    if (classes[Face.au_01.value][i] and classes[Face.au_02.value][i] and classes[Face.au_04.value][i]
        and classes[Face.au_07.value][i] and classes[Face.au_20.value][i] and classes[Face.au_26.value][i]):
        fear.append(True)
    else:
        fear.append(False)
        
    # Predict anger
    if (classes[Face.au_04.value][i] and classes[Face.au_05.value][i] and classes[Face.au_07.value][i]):
        anger.append(True)
    else:
        anger.append(False)
    
    # Predict contempt
    if (classes[Face.au_12.value][i] and classes[Face.au_14.value][i]):
        contempt.append(True)
    else:
        contempt.append(False)

for i in range(len(frames)):
    time = int(frames[i] * 33)
    emotions = ""
    if (joy[i]):
        emotions = "joy "
    if (sadness[i]):
        emotions = emotions + "sadness "
    if (surprise[i]):
        emotions = emotions + "surprise "
    if (fear[i]):
        emotions = emotions + "fear "
    if (anger[i]):
        emotions = emotions + "anger "
    if (contempt[i]):
        emotions = emotions + "contempt"

    package = {"ms" : time, "uid" : uid, "t" : "au", "emotions" : emotions}
    upload.insert_one(package)

# Graphical demonstration
plt.rcParams['figure.figsize'] = (15.0, 6.0)
x_on = []
y_on = []
x_off = []
y_off = []

for frame in range(250):
    if (joy[frame]):
        x_on.append(frame)
        y_on.append(6)
    else:
        x_off.append(frame)
        y_off.append(6)
    
    if (sadness[frame]):
        x_on.append(frame)
        y_on.append(5)
    else:
        x_off.append(frame)
        y_off.append(5)
    
    if (surprise[frame]):
        x_on.append(frame)
        y_on.append(4)
    else:
        x_off.append(frame)
        y_off.append(4)
    
    if (fear[frame]):
        x_on.append(frame)
        y_on.append(3)
    else:
        x_off.append(frame)
        y_off.append(3)
    
    if (anger[frame]):
        x_on.append(frame)
        y_on.append(2)
    else:
        x_off.append(frame)
        y_off.append(2)
        
    if (contempt[frame]):
        x_on.append(frame)
        y_on.append(1)
    else:
        x_off.append(frame)
        y_off.append(1)

plt.scatter(x_on, y_on, color = 'blue')
plt.scatter(x_off, y_off, color = 'red')
plt.savefig('au.png')
plt.show()