# Basic Python connector using dummy data.
# Demonstrates connection and how to obtain arrays of specific values.
from pymongo import MongoClient
# Passes the connection string to the client.
client = MongoClient('mongodb://sherlock_dev:eJ69vujCfrs9k3@localhost:27017/?authSource=sherlock_dev&readPreference=primary&appname=MongoDB%20Compass&ssl=false')
db = client.sherlock_dev

value_list = []
color_list = []

# Cycles through the elements by index and appends them to the arrays.
for i in range(1, 10):
    entry = db.data.find_one({'index':i})
    value_list.append(entry.get('value'))
    color_list.append(entry.get('color'))

# Print an array of the colors of each object in the database.
print(color_list)
# Print an array of the values of each object in the database.
print(value_list)
