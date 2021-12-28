# POST Http API 
Packages required:
1. Flask 
[Installation guide](https://pypi.org/project/Flask/ "Flask")

This should be run from Raspberry Pi from this directory.

Change the ip address inside the file `app.py` to your raspberry pi ip address 

Run the script  `export FLASK_APP=app.py;flask run --host=<your_ip_address>` from terminal or from an IDE of choice

# Raspberry Pi 4 Facial Recognition
Reference Article - https://www.tomshardware.com/how-to/raspberry-pi-facial-recognition

Hardware: Raspberry Pi 4 and Webcam

Packages required:

1. OpenCV 
[Installation guide](https://www.pyimagesearch.com/2018/09/26/install-opencv-4-on-your-raspberry-pi/ "OpenCV")
2. [Facialrecognition](https://pypi.org/project/face-recognition/)

Run the script headshots_picam.py from terminal: `python headshots_picam.py`

Run the script train.py from terminal: `python train.py`

For running the application:

Run the script  `IoTProject_Speech_Face_Recognition1.py` from terminal or from an IDE of choice

# Raspberry Pi 4 Voice Recognition
Reference Article - https://maker.pro/raspberry-pi/projects/speech-recognition-using-google-speech-api-and-python

Hardware: Raspberry Pi 4 and Microphone [Amazon Link](https://www.amazon.com/SunFounder-Microphone-Raspberry-Recognition-Software/dp/B01KLRBHGM/ref=sr_1_3?dchild=1&keywords=raspberry+pi+microphone&qid=1621220708&sr=8-3)


Package required:

1.	[SpeechRecognition](https://pypi.org/project/SpeechRecognition/)
2.	[Pyttsx3](https://pypi.org/project/pyttsx3/)

# Google Calendar API:
Reference Article: https://developers.google.com/calendar/quickstart/python

Packages required:
1.	[google-api-python-client](https://pypi.org/project/google-api-python-client/)
2.	[google-auth-oauthlib](https://pypi.org/project/google-auth-oauthlib/)
3.	[google-auth-httplib2](https://pypi.org/project/google-auth-httplib2/)

# News API:
Reference Article: https://newsapi.org/docs/client-libraries/python

Packages used:
1.	[Newsapi-python](https://pypi.org/project/newsapi-python/)


# Pose Estimation:
Reference Video: https://www.youtube.com/watch?v=RUp-K4NEllg 

Packages Used:
1.	[Github Repository](https://github.com/ecd1012/rpi_pose_estimation)
2.	[PoseNet pretrained model](https://www.tensorflow.org/lite/examples/pose_estimation/overview)

