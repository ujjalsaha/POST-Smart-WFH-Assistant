import sqlite3

#for SMTP Email
import os
import smtplib

from datetime import date, datetime


EMAIL = "ashpra1223@gmail.com"
PASSWORD = "bufdnklhqgeughmt"

conn = sqlite3.connect('post.db')
cursor = conn.cursor()
param = "good morning post"
today = date.today()
cursor.execute("SELECT * FROM voice where v_speech = ? and v_date = ?", (param,today))
rows = cursor.fetchall()

if rows==[]:
    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        
        smtp.login(EMAIL, PASSWORD)
        
        
        subject = 'Too much party last night?'
        body = 'You are late for work!'
        
        
        msg = f'Subject: {subject}\n\n{body}'
        
        smtp.sendmail(EMAIL, EMAIL, msg)
 
# 
# 
# 
# for row in rows:
#     if (datetime.strptime(row[2], '%I:%M:%S')>datetime.strptime('9:00AM', '%I:%M%p')):
#         with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
#             smtp.ehlo()
#             smtp.starttls()
#             smtp.ehlo()
#             
#             smtp.login(EMAIL, PASSWORD)
#             
#             
#             subject = 'Too much party last night?'
#             body = 'You are late for work!'
#             
#             
#             msg = f'Subject: {subject}\n\n{body}'
#             
#             smtp.sendmail(EMAIL, EMAIL, msg)
#         
