# Data analysis and processing program
# Inputs data from the processing collection of sherlock_dev and outputs into the ml_out collection
# Data is purged from the processing collection after finishing

# This file is currently in a state where it has to be constantly run, as the frontend
# does not currently have the functionality to call this file and process data.

# Additionally, as the database is structured as a 'Standalone' cluster, we were not able
# to make it only run when new data is added. Instead, continuously querying the database
# and calling function when data upload is finished (detected through the means of the sleep function).

import os
from time import sleep
import time
import pymongo
from bson.json_util import dumps
from pymongo import MongoClient

client = MongoClient('mongodb://sherlock_dev:eJ69vujCfrs9k3@localhost:27017/?authSource=sherlock_dev&readPreference=primary&appname=MongoDB%20Compass&ssl=false')

# Removes processed data from the processing collection.
def purge_docs(db, doc_type, uid, timestamps):
        for i in range(len(timestamps)):
                db.remove({"t":doc_type, "uid":uid, "ms":timestamps[i]})

# Collection of data to process.
db = client.sherlock_dev.processing

timestamp, prev, counter, final_counter = 0, 0, 0, 0
prev_doc_type = ""
prev_uid = ""
timestamps, values = [], []
query = {}
while True:
        documents = db.find(query)
        counter = 0
        # Looping through the documents
        for doc in documents:
                doc_type = doc.get('t')
                uid = doc.get('uid')
                timestamp = doc.get('ms')

                # Check if the document type and user id matches the previous document.
                if (prev_doc_type == "" and counter >= final_counter):
                        timestamps.append(timestamp)
                        prev_doc_type = doc_type
                        prev_uid = uid
                elif (doc_type == prev_doc_type and prev_uid == uid and counter >= final_counter):
                        timestamps.append(timestamp)
                        prev_doc_type = doc_type
                        prev_uid = uid
                else:
                        prev_doc_type = doc_type
                        prev_uid = uid
                counter += 1
        final_counter = counter
        if (prev == timestamp):
                # RUN FILE WITH TYPE t
                if (len(timestamps) > 0):
                        if (doc_type == 'hr' or doc_type == 'ibi' or doc_type == 'gsr'):
                                command =  'python3 peak_finder.py ' + doc_type + ' ' + uid
                        elif (doc_type == 'au'):
                                command = 'python3 action_units.py ' + uid
                        ### TODO: find a way to obtain the link to the desired gameplay on vimeo from the database 
                        ###       restructure faceRecognition.py to pull gazepoint data from the database instead of from a local csv 
                        # elif (doc_type == 'gp')
                        #        command = 'python faceRecognition.py --encodings encodings.pickle --input ' + video + ' --gazepoint ' gazepoint
                        res = os.system(command)
                        if (res == 0):
                                purge_docs(db, doc_type, uid, timestamps)
                                timestamps = []
                                timestamp = 0
        prev = timestamp
        print("prev = ", prev)
        sleep(1)
