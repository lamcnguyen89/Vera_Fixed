import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import pymongo
from pymongo import MongoClient

# Algorithm for Peak Detection
# 'Y' is the array of the Y components of the data points plotted
# 'index' is the index of the point being assessed as a pea
# 'n' is the number of points in the csv file being processed
# 'm' is the margin of how many neighbors above and below a point that it is compared with
def peak_detect(Y, index, n, m):
    if (index >= n - m):
        min_index = index - m
        max_index = n - 1
    elif (index <= m):
        min_index = 0
        max_index = index + m
    else:
        min_index = index - m
        max_index = index + m
        
    while (min_index <= max_index):
        if (Y[min_index] > Y[index]):
            return False
        min_index += 1
        
    return True

# Passes the connection string to the client.
client = MongoClient('mongodb://sherlock_dev:eJ69vujCfrs9k3@localhost:27017/?authSource=sherlock_dev&readPreference=primary&appname=MongoDB%20Compass&ssl=false')
db = client.sherlock_dev
data = db["bios"]
upload = db["ml_out"]

# Queries the database for heart rate
# TO DO: Make uid adjustable and not hard coded.
uid = "8cbdcb57-af99-4502-a408-a60b6c0e8e9c"
query = {"t" : "hr", "uid" : uid}
doc = data.find(query)

time = []
heart_rate = []
for x in doc:
    time.append(x.get('ms'))
    heart_rate.append(x.get('v'))

# Number of measurements
n = len(time)

peaks_X = []
peaks_Y = []
margin = 50
# Loop to find all peaks
for i in range(n):
    if (peak_detect(heart_rate, i, n, margin)):
        peaks_X.append(time[i])
        peaks_Y.append(heart_rate[i])
        package = {"ms" : time[i], "uid" : uid, "t" : "hr"}
        upload.insert_one(package)

# Plot graph with peaks
plt.rcParams['figure.figsize'] = (15.0, 6.0)
plt.scatter(time, heart_rate)
plt.scatter(peaks_X, peaks_Y, color = 'red')
plt.savefig('heart2.png')
plt.show()
