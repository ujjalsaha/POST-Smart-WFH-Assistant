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


from datetime import date
import datetime


#for SMTP Email
import os
import smtplib

#for Sqlite
# import sys
# sys.path.insert(1,"/path/to/project/database")
from postdb import PostDB

from threading import Thread
import subprocess
EMAIL = "ashpra1223@gmail.com"
PASSWORD = "bufdnklhqgeughmt"

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

def main():
    
    '''
    Google Calendar API Code Starts
        
    '''
    
    creds = None
    
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('calendar', 'v3', credentials=creds)

    # Call the Calendar API
    now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time
#     print('Getting the upcoming 10 events')
    events_result = service.events().list(calendarId='primary', timeMin=now,
                                        maxResults=10, singleEvents=True,
                                        orderBy='startTime').execute()
    events = events_result.get('items', [])
    
       
    

    '''
    Creating the Database
    '''
    db = PostDB()
    '''
    Creating newsapi Client for top 5 news
    '''
    newsapi = NewsApiClient(api_key='2b9828f5c8014cd9b7de1011623ff4fe')

    top_headlines = newsapi.get_top_headlines(country='us')
    '''
    Calculating the day
    '''
    day = datetime.datetime.today().weekday() + 1
          
    Day_dict = {1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
                4: 'Thursday', 5: 'Friday', 6: 'Saturday',
                7: 'Sunday'}
      
    if day in Day_dict.keys():
        day_of_the_week = Day_dict[day]
                    
    today = date.today()
    d2 = today.strftime("%B %d %Y")
    todaydate = "Today's date is"+day_of_the_week+" "+ d2
    
    '''
    Initializing Voice Engine
    '''
    engine = pyttsx3.init()
    engine.setProperty('rate', 170)
    engine.setProperty('volume', 0.9)
    
    '''
    Getting the phrase from the speech recognition module
    '''
    r = sr.Recognizer()
    speech = sr.Microphone(device_index=2)     
    phrase = speech_recog(r,speech)
    if (phrase !='Unknown Value Error' or phrase !='Request Error' or phrase != 'Monitoring'):
        db.insert_voice(phrase)
    print (phrase)
    
    if phrase == "good morning post":
        '''
        Getting the person name from facial detection module
        '''
        person =facial_recog()
        print (person)
        if person == 'Ashish':
#             print("inner loop")
            db.insert_face("Ashish")
            engine.say("Hello Ashish")
            engine.runAndWait()
            engine.say(todaydate)
            engine.runAndWait()
            for i in range(2):
                engine.say(top_headlines['articles'][i]['title'] )
                engine.runAndWait()
            
            if not events:
                engine.say('No upcoming events in calendar found.')
                engine.runAndWait()
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                print(start, event['summary'])
                engine.say("Heare are Your Calendar Appintments:")
                engine.say(event['summary'])
                engine.runAndWait()
#                 print ("end calendar")
            '''
            Multi Threading Starts

            '''
            t1 = Thread(target=subprocess.run, args=(["python3", "sound_detection_1.py"],))
            t2 = Thread(target=subprocess.run, args=(["python3", "pose_estimation.py"],))

            t1.start()
            t2.start()

           

        else:
            db.insert_face("Unknown User")
            engine.say("Unknown User")
            engine.runAndWait()
            
            with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()
                
                smtp.login(EMAIL, PASSWORD)
                
                
                subject = 'Unknown Person in the Office Room!'
                body = 'Unknown Person in the Office Room!'
                
                
                msg = f'Subject: {subject}\n\n{body}'
                
                smtp.sendmail(EMAIL, EMAIL, msg)
            
            
                
    else :
        engine.say("please say good morning post. ending application")
        engine.runAndWait()

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



def facial_recog():
    
    currentname = "Unknown"
    #Determine faces from encodings.pickle file model created from train_model.py
    encodingsP = "encodings.pickle"
    #use this xml file
    cascade = "haarcascade_frontalface_default.xml"    

    print("[INFO] loading encodings + face detector...")

    vs = VideoStream(usePiCamera=True).start()
    time.sleep(2.0)

    # start the FPS counter
    fps = FPS().start()

    with open(encodingsP, 'rb') as f:
        u = pickle._Unpickler(f)
        u.encoding = 'latin1'
        p = u.load()
    data = p
    detector = cv2.CascadeClassifier(cascade)
    while True:
	# grab the frame from the threaded video stream and resize it
	# to 500px (to speedup processing)
        frame = vs.read()
        frame = imutils.resize(frame, width=500)
        
        # convert the input frame from (1) BGR to grayscale (for face
        # detection) and (2) from BGR to RGB (for face recognition)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # detect faces in the grayscale frame
        rects = detector.detectMultiScale(gray, scaleFactor=1.1, 
            minNeighbors=5, minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE)

        # OpenCV returns bounding box coordinates in (x, y, w, h) order
        # but we need them in (top, right, bottom, left) order, so we
        # need to do a bit of reordering
        boxes = [(y, x + w, y + h, x) for (x, y, w, h) in rects]

        # compute the facial embeddings for each face bounding box
        encodings = face_recognition.face_encodings(rgb, boxes)
        names = []

        # loop over the facial embeddings
        for encoding in encodings:
            # attempt to match each face in the input image to our known
            # encodings
            matches = face_recognition.compare_faces(data["encodings"],
                encoding)
            name = "Unknown" #if face is not recognized, then print Unknown

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
                
                #If someone in your dataset is identified, print their name on the screen
                if currentname != name:
                    currentname = name
                    print(currentname)
            
        # loop over the recognized faces
        for ((top, right, bottom, left), name) in zip(boxes, names):
            # draw the predicted face name on the image - color is in BGR
            cv2.rectangle(frame, (left, top), (right, bottom),
                (0, 255, 225), 2)
            y = top - 15 if top - 15 > 15 else top + 15
            cv2.putText(frame, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,
                .8, (0, 255, 255), 2)

        # display the image to our screen
        cv2.imshow("Facial Recognition is Running", frame)
        #break from while loop
        break
    
    # stop the timer and display FPS information
    fps.stop()
    print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
    print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

    # do a bit of cleanup
    cv2.destroyAllWindows()
    vs.stop()
    return currentname


if __name__ == "__main__":
    try: 
        main()
    finally: 
        ""

