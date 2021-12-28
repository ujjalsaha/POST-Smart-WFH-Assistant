from __future__ import print_function
import datetime
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials


from newsapi import NewsApiClient

#Speech Recognition Libraries
import speech_recognition as sr


import pyttsx3
import pyaudio
from ctypes import *

#Facial Recognition Libraries
from imutils.video import VideoStream
from imutils.video import FPS
import face_recognition
import imutils
import pickle
import time
import cv2


import os
import argparse
import cv2
import numpy as np
import sys
import pdb
import time
import math
import pathlib
from threading import Thread
import importlib.util
import datetime

import time

#for Sqlite
# import sys
# sys.path.insert(1,"/path/to/project/database")
from postdb import PostDB


def speech_recog(r, speech):
    with speech as source:
        audio = r.adjust_for_ambient_noise(source)
        audio = r.listen(source, timeout=5)
    try:
        recog = r.recognize_google(audio, language = 'en-US')
        return (recog)

    except sr.UnknownValueError:
#         engine.say("Google Speech Recognition could not understand audio")
#         engine.runAndWait()
        recog = 'Unknown Value Error'
        return recog
    except sr.RequestError as e:
#         engine.say("Could not request results from Google Speech Recognition service; {0}".format(e))
#         engine.runAndWait()
        recog = 'Request Error'
        return recog
    except sr.WaitTimeoutError:
        recog = 'Monitoring'
        return recog


'''
Creating the Database
'''
db = PostDB()
  
'''
Initializing Voice Engine
'''
engine = pyttsx3.init()
engine.setProperty('rate', 170)
engine.setProperty('volume', 0.9)

'''
Getting the phrase from the sppech recognition module
'''
r = sr.Recognizer()
speech = sr.Microphone(device_index=2)     
phrase = speech_recog(r,speech)
print (phrase)
while True:
    recog = speech_recog(r, speech)
    if(recog != 'stop monitoring post'):
        print(recog)
#         engine.say(recog)
#         engine.runAndWait()
        if (phrase !='Unknown Value Error' or phrase !='Request Error' or phrase != 'Monitoring'):
            db.insert_voice(recog)
        
        
    else:
        engine.say("ending application")
        engine.runAndWait()
        break
        






