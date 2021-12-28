from flask import Flask
from flask import render_template
from flask import request, jsonify

import  json
import time
from postdb import PostDB
from datetime import datetime, timedelta
from pprint import pprint
# Simple Web Service using Flask
app = Flask(__name__)


# GET  Get Daily login information
@app.route('/login/',methods = ['GET'])
def get_login_data():
    ret = {}    
    if request.method == 'GET':
        print(f"Login data request received")
        print (f"get_login_data GET: Week")

        today = datetime.today().strftime('%Y-%m-%d')
        data = PostDB().execute(f"SELECT v_time "
                                f"  FROM voice "
                                f" WHERE v_date = '{today}' AND v_speech = 'good morning post'"
                                f" ORDER BY v_time;")

        if data :
            data = data[0]
            ret = {'login_date': today, 'login_time': data['v_time'], 'late_login': True if int(data['v_time'].split(':')[0]) > 9 else False}

        #pprint(ret)
        return json.dumps(ret)

# GET  Get Weekly Voice detection Count
@app.route('/voice/weekly/',methods = ['GET'])
def get_weekly_voice_data():
    if request.method == 'GET':
        week = int(request.args.get('week', default = "-1", type = str))
        print(f"Week as received for Voice: {week}")
        print (f"get_weekly_voice_data GET: Week: {'Current week' if week == -1 else week - 1}")

        week = datetime.today().isocalendar()[1] if week == -1 else week - 1
        print(f"Week: {week}")
        startdate = time.asctime(time.strptime('2021 %d 0' % week, '%Y %W %w'))
        startdate = datetime.strptime(startdate, '%a %b %d %H:%M:%S %Y')
        dates = [startdate.strftime('%Y-%m-%d')]
        for i in range(1, 7):
            day = startdate + timedelta(days=i)
            dates.append(day.strftime('%Y-%m-%d'))

        print(dates)    

        sql_dates = "'" + "','".join(dates) + "'"

        data = PostDB().execute(f"SELECT v_date, count(v_time) as v_count "
                                f"  FROM voice "
                                f" WHERE v_date IN ({sql_dates}) "
                                f" GROUP BY v_date;")
        #                        " WHERE v_date >= date('now', '-10 days') "

        data = {d['v_date']: d['v_count'] for d in data}

        ret = []
        for i, date in enumerate(dates):
            ret.append({'v_date': date, 'v_count': 0} if date not in data else \
                    {'v_date': date, 'v_count': data[date]})

        #pprint(ret)
        return json.dumps(ret)

# GET Get Daily Voice Detection Count
@app.route('/voice/daily/',methods = ['GET'])
def get_daily_voice_data():

    if request.method == 'GET':
        #date = request.data
        #date = date.decode("UTF-8").strip('\'')
        date = request.args.get('date', default = datetime.today().strftime('%Y-%m-%d'), type = str).strip()
        print (f"get_hourly_voice data GET: Date: --{date}--")
   
        sql = (f"SELECT v_time "
               f"  FROM voice "
               f" WHERE v_date = '{date}'")

        #pprint(sql)
        data = PostDB().execute(sql)

        #pprint(data)
        hourly = {}
        for d in data:
            time = d['v_time']
            hour = time.split(':')[0]
            hourly[hour] = 1 if hour not in hourly else hourly[hour] + 1

        hourly = {f"{i+1:02}": hourly[f"{i+1:02}"] if f"{i+1:02}" in hourly else 0 for i in range(24)}
        ret = [{'v_hour': hour, 'v_count': count} for hour, count in hourly.items()]

        #pprint(ret)
        return json.dumps(ret)

# GET  Get Weekly Posture Count
@app.route('/posture/weekly/',methods = ['GET'])
def get_weekly_posture_data():
    if request.method == 'GET':
        week = int(request.args.get('week', default = "-1", type = str))
        print(f"Week as received for Posture: {week}")
        print (f"get_weekly_posture_data GET: Week: {'Current week' if week == -1 else week - 1}")

        week = datetime.today().isocalendar()[1] if week == -1 else week - 1
        startdate = time.asctime(time.strptime('2021 %d 0' % week, '%Y %W %w'))
        startdate = datetime.strptime(startdate, '%a %b %d %H:%M:%S %Y')
        dates = [startdate.strftime('%Y-%m-%d')]
        for i in range(1, 7):
            day = startdate + timedelta(days=i)
            dates.append(day.strftime('%Y-%m-%d'))

        print(dates)    

        sql_dates = "'" + "','".join(dates) + "'"

        data = PostDB().execute(f"SELECT m_date, count(m_time) as m_count "
                                f"  FROM motion "
                                f" WHERE m_date IN ({sql_dates}) "
                                f" GROUP BY m_date;")

        data = {d['m_date']: d['m_count'] for d in data}

        ret = []
        for i, date in enumerate(dates):
            ret.append({'m_date': date, 'm_count': 0} if date not in data else \
                    {'m_date': date, 'm_count': data[date]})

        #pprint(ret)
        return json.dumps(ret)

# GET  Get Daily Posture Count
@app.route('/posture/daily/',methods = ['GET'])
def get_daily_data():

    if request.method == 'GET':
        #date = request.data
        #date = date.decode("UTF-8").strip('\'')
        date = request.args.get('date', default = datetime.today().strftime('%Y-%m-%d'), type = str).strip()
        print (f"get_hourly_posture_data GET: Date: --{date}--")
   
        sql = (f"SELECT m_time "
               f"  FROM motion "
               f" WHERE m_date = '{date}'")

        pprint(sql)
        data = PostDB().execute(sql)

        #pprint(data)
        hourly = {}
        for d in data:
            time = d['m_time']
            hour = time.split(':')[0]
            hourly[hour] = 1 if hour not in hourly else hourly[hour] + 1

        hourly = {f"{i+1:02}": hourly[f"{i+1:02}"] if f"{i+1:02}" in hourly else 0 for i in range(24)}
        ret = [{'m_hour': hour, 'm_count': count} for hour, count in hourly.items()]

        #pprint(ret)
        return json.dumps(ret)

if __name__ == '__main__':
    ip = {'u': '192.168.86.117', 'a':'192.168.10.6'}
    app.run(host=ip.get('u'), port=5000, debug=True)



