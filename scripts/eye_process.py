# This is a file with helper function to work with gazepoint eye tracking data.

import pandas as pd
import numpy as np

looking_at_screen = []

def process_eye_data(path, width, height):
    print("Reading {0} file.".format(path))
    data = pd.read_csv(path)
    X = data.iloc[:, 1]
    Y = data.iloc[:, 2]

    x_on = []
    y_on = []

    for i in range(len(X)):
        if (X[i] > 0 and X[i] < 1) and (Y[i] > 0 and Y[i] < 1):
            x_on.append((int) (X[i] * width))
            y_on.append((int) (Y[i] * height))
            looking_at_screen.append(True)
        else:
            looking_at_screen.append(False)

    eye_points = np.vstack((x_on, y_on))
    print("Finished reading {0} file.".format(path))
    return eye_points

# Returns the array of booleans that states whether or not the user is looking at the screen at this individual frame.
# Computed in the process_eye_data function.
def is_looking():
    return looking_at_screen

# Returns true if the point the user is looking at is within the bounding box being drawn around a face.
def in_box(x, y, w, h, dist, point_x, point_y):
    # Original point
    if ((point_x > x and point_x < x + w) and (point_y > y and point_y < y + h)):
        return "Looking"
    # Extended point at 0 degrees.
    elif ((point_x + dist > x and point_x + dist < x + w) and (point_y > y and point_y < y + h)):
        return "Looking"
    # Extended point at 45 degrees.
    elif ((point_x + dist / 2 > x and point_x + dist / 2 < x + w) and (point_y + dist / 2 > y and point_y + dist / 2 < y + h)):
        return "Looking"
    # Extended point at 90 degrees.
    elif ((point_x > x and point_x < x + w) and (point_y + dist > y and point_y + dist < y + h)):
        return "Looking"
    # Extended point at 135 degrees.
    elif ((point_x - dist / 2 > x and point_x - dist / 2 < x + w) and (point_y + dist / 2 > y and point_y + dist / 2 < y + h)):
        return "Looking"
    # Extended point at 180 degrees.
    elif ((point_x - dist > x and point_x - dist < x + w) and (point_y > y and point_y < y + h)):
        return "Looking"
    # Extended point at 225 degrees.
    elif ((point_x - dist / 2 > x and point_x - dist / 2 < x + w) and (point_y - dist / 2 > y and point_y - dist / 2 < y + h)):
        return "Looking"
    # Extended point at 270 degrees.
    elif ((point_x > x and point_x < x + w) and (point_y - dist > y and point_y - dist < y + h)):
        return "Looking"
    elif ((point_x + dist / 2 > x and point_x + dist / 2 < x + w) and (point_y - dist / 2 > y and point_y - dist / 2 < y + h)):
        return "Looking"
    else:
        return "Not Looking"