from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz
import time
import serial
import serial.tools.list_ports

app = Flask(__name__)
CORS(app, resources={r"/clock/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/alarm/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/stopwatch/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/timer/*": {"origins": "http://localhost:3000"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clock.db'
db = SQLAlchemy(app)
arduinoData = serial.Serial()
arduinoData.baudrate = 9600
arduinoData.port = 'com4'


class Time(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    time_type = db.Column(db.String(20))
    hour = db.Column(db.Integer)
    minute = db.Column(db.Integer)
    second = db.Column(db.Integer)



@app.route('/clock/real', methods=['POST'])
def set_real_time():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid data received'}), 400

    utc_offset_str = data['UTC']

    try:
        offset_number = int(utc_offset_str)
        if offset_number > 0:
            timezone = pytz.timezone(f"Etc/GMT{-offset_number}")
        else:
            timezone = pytz.timezone(f"Etc/GMT+{-offset_number}")

        current_utc = datetime.now(pytz.utc)
        real_time = current_utc.astimezone(timezone)

        hour = real_time.hour
        minute = real_time.minute
        second = real_time.second

        new_time_entry = Time(time_type="clock", hour=hour, minute=minute, second=second)
        db.session.add(new_time_entry)
        db.session.commit()

        return jsonify({'message': 'Time successfully set'}), 200
    except Exception as e:
        print('Error in setting real time:', str(e))
        return jsonify({'error': 'An error occurred during setting real time', 'details:': str(e)}), 500

        
@app.route('/clock/real', methods=['GET'])
def send_real_time():
    try:
        last_time_entry = Time.query.filter(Time.time_type == "clock").order_by(Time.id.desc()).first()

        if last_time_entry is None:
            return jsonify({'error': 'No time found'}), 404

        time_components = {
            'hour': last_time_entry.hour,
            'minute': last_time_entry.minute,
            'second': last_time_entry.second
        }
        db.session.delete(last_time_entry)
        db.session.commit()
        arduinoData.open()
        arduinoData.write(bytes([1]))
        arduinoData.close()
        time.sleep(0.1)
        arduinoData.open()
        arduinoData.write(bytes([last_time_entry.hour]))
        arduinoData.write(bytes([last_time_entry.minute]))
        arduinoData.write(bytes([last_time_entry.second]))
        arduinoData.close()

        return jsonify(time_components), 200
    except Exception as e:
        print('Error in retrieving real time:', str(e))
        return jsonify({'error': 'An error occurred during retrieving real time', 'details:': str(e)}), 500


@app.route('/clock/set', methods=['POST'])
def set_user_time():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid data received'}), 400
        
        time_to_set = Time(time_type = "clock", hour = data['user_hour'], minute = data['user_minute'], second = data['user_second'])
        print("Got time:", time_to_set.hour,":",time_to_set.minute,":",time_to_set.second)

        db.session.add(time_to_set)
        db.session.commit()
        arduinoData.open()
        arduinoData.write(bytes([1]))
        arduinoData.close()
        time.sleep(0.1)
        arduinoData.open()
        arduinoData.write(bytes([time_to_set.hour]))
        arduinoData.write(bytes([time_to_set.minute]))
        arduinoData.write(bytes([time_to_set.second]))
        arduinoData.close()
        return jsonify({'message': 'Time successfully set'}), 200
    
    except Exception as e:
        print('Error in setting user time:', str(e))
        return jsonify({'error': 'An error occurred during setting user time', 'details:': str(e)}), 500
    
@app.route('/clock', methods=['GET'])
def choose_clock():
    arduinoData.open()
    arduinoData.write(bytes([1]))
    arduinoData.close()
    return jsonify({'message': 'Clock successfully chosen'}), 200


@app.route('/alarm/set', methods=['POST'])
def set_alarm():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid data received'}), 400
        
        time_to_set = Time(time_type = "alarm", hour = int(data['user_hour']), minute = int(data['user_minute']), second = data['user_second'])
        print("Got time:", time_to_set.hour,":",time_to_set.minute,":",time_to_set.second)

        arduinoData.open()
        arduinoData.write(bytes([2]))
        arduinoData.close()
        time.sleep(0.1)
        arduinoData.open()
        arduinoData.write(bytes([time_to_set.hour]))
        arduinoData.write(bytes([time_to_set.minute]))
        arduinoData.close()

        return jsonify({'message': 'Alarm successfully set'}), 200
    
    except Exception as e:
        print('Error in setting alarm:', str(e))
        return jsonify({'error': 'An error occurred during setting alarm', 'details:': str(e)}), 500


@app.route('/alarm/save', methods=['POST'])
def save_alarm():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid data received'}), 400
        
        time_to_save = Time(time_type = "alarm", hour = data['user_hour'], minute = data['user_minute'], second = data['user_second'])
        print("Got time:", time_to_save.hour,":",time_to_save.minute,":",time_to_save.second)

        db.session.add(time_to_save)
        db.session.commit()
        return jsonify({'message': 'Alarm successfully saved'}), 200
    
    except Exception as e:
        print('Error in saving alarm:', str(e))
        return jsonify({'error': 'An error occurred during saving alarm', 'details:': str(e)}), 500


@app.route('/alarm/choose', methods=['GET'])
def choose_alarm():
    try:
        alarms = Time.query.filter(Time.time_type == "alarm").order_by(Time.id.desc()).limit(5).all()
        alarms_list = [{"hour": alarm.hour, "minute": alarm.minute} for alarm in alarms]
        
        return jsonify(alarms_list), 200
    except Exception as e:
        print('Error in retrieving alarms:', str(e))
        return jsonify({'error': 'An error occurred during retrieving alarms', 'details:': str(e)}), 500
    

@app.route('/alarm', methods=['GET'])
def choose_alarm_mode():
    arduinoData.open()
    arduinoData.write(bytes([2]))
    arduinoData.close()
    return jsonify({'message': 'Alarm successfully chosen'}), 200


@app.route('/stopwatch/save', methods=['POST'])
def save_stopwatch():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid data received'}), 400
        
        time_to_save = Time(time_type = "stopwatch", hour = data['user_hour'], minute = data['user_minute'], second = data['user_second'])
        print("Got time:", time_to_save.hour,":",time_to_save.minute,":",time_to_save.second)

        db.session.add(time_to_save)
        db.session.commit()
        return jsonify({'message': 'Stopwatch successfully saved'}), 200
    
    except Exception as e:
        print('Error in saving stopwatch:', str(e))
        return jsonify({'error': 'An error occurred during saving stopwatch', 'details:': str(e)}), 500


@app.route('/stopwatch/start', methods=['POST'])
def start_stopwatch():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid data received'}), 400
        
        time_to_set = Time(time_type = "stopwatch", hour = data['user_hour'], minute = data['user_minute'], second = data['user_second'])
        db.session.add(time_to_set)
        db.session.commit()
        print("Got time:", time_to_set.hour,":",time_to_set.minute,":",time_to_set.second)
        arduinoData.open()
        arduinoData.write(bytes([3]))
        arduinoData.close()
        time.sleep(0.1)
        arduinoData.open()
        arduinoData.write(bytes([time_to_set.hour]))
        arduinoData.write(bytes([time_to_set.minute]))
        arduinoData.write(bytes([time_to_set.second]))
        arduinoData.close()

        return jsonify({'message': 'Stopwatch successfully started'}), 200
    
    except Exception as e:
        print('Error in starting stopwatch:', str(e))
        return jsonify({'error': 'An error occurred during starting stopwatch', 'details:': str(e)}), 500


@app.route('/stopwatch/stop', methods=['GET'])
def stop_stopwatch():
    try:
        stopwatch_time = Time.query.filter(Time.time_type == "stopwatch").order_by(Time.id.desc()).first()
        time_components = {
            'hour': stopwatch_time.hour,
            'minute': stopwatch_time.minute,
            'second': stopwatch_time.second
        }
        db.session.delete(stopwatch_time)
        db.session.commit()
        arduinoData.open()
        arduinoData.write(bytes([3]))
        time.sleep(0.1)
        arduinoData.write(bytes([61]))
        while arduinoData.in_waiting < 3:
            time.sleep(0.1)
        time_components['hour'] = int.from_bytes(arduinoData.read(), byteorder='big')
        time_components['minute'] = int.from_bytes(arduinoData.read(), byteorder='big')
        time_components['second'] = int.from_bytes(arduinoData.read(), byteorder='big')
        arduinoData.close()
        return jsonify(time_components), 200
    except Exception as e:
        print('Error in retrieving stopwatch time:', str(e))
        return jsonify({'error': 'An error occurred during retrieving stopwatch time', 'details:': str(e)}), 500


@app.route('/stopwatch/loop', methods=['GET'])
def loop_stopwatch():
    try:
        stopwatch_time = Time.query.filter(Time.time_type == "stopwatch").order_by(Time.id.desc()).first()
        time_components = {
            'hour': stopwatch_time.hour,
            'minute': stopwatch_time.minute,
            'second': stopwatch_time.second
        }
        arduinoData.open()
        arduinoData.write(bytes([3]))
        time.sleep(0.1)
        arduinoData.write(bytes([62]))
        while arduinoData.in_waiting < 3:
            time.sleep(0.1)
        time_components['hour'] = int.from_bytes(arduinoData.read(), byteorder='big')
        time_components['minute'] = int.from_bytes(arduinoData.read(), byteorder='big')
        time_components['second'] = int.from_bytes(arduinoData.read(), byteorder='big')
        arduinoData.close()
        return jsonify(time_components), 200
    except Exception as e:
        print('Error in retrieving stopwatch time:', str(e))
        return jsonify({'error': 'An error occurred during retrieving stopwatch time', 'details:': str(e)}), 500
    
@app.route('/stopwatch', methods=['GET'])
def choose_stopwatch():
    arduinoData.open()
    arduinoData.write(bytes([3]))
    arduinoData.close()
    return jsonify({'message': 'Stopwatch successfully chosen'}), 200


@app.route('/timer/start', methods=['POST'])
def start_timer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid data received'}), 400
        
        time_to_set = Time(time_type = "timer", hour = data['user_hour'], minute = data['user_minute'], second = data['user_second'])
        db.session.add(time_to_set)
        db.session.commit()
        print("Got time:", time_to_set.hour,":",time_to_set.minute,":",time_to_set.second)
        arduinoData.open()
        arduinoData.write(bytes([4]))
        arduinoData.close()
        time.sleep(0.1)
        arduinoData.open()
        arduinoData.write(bytes([time_to_set.hour]))
        arduinoData.write(bytes([time_to_set.minute]))
        arduinoData.write(bytes([time_to_set.second]))
        arduinoData.close()

        return jsonify({'message': 'Timer successfully started'}), 200
    
    except Exception as e:
        print('Error in starting timer:', str(e))
        return jsonify({'error': 'An error occurred during starting timer', 'details:': str(e)}), 500
    
@app.route('/timer/stop', methods=['GET'])
def stop_timer():
    try:
        timer_time = Time.query.filter(Time.time_type == "timer").order_by(Time.id.desc()).first()
        time_components = {
            'hour': timer_time.hour,
            'minute': timer_time.minute,
            'second': timer_time.second
        }
        db.session.delete(timer_time)
        db.session.commit()
        arduinoData.open()
        arduinoData.write(bytes([4]))
        arduinoData.close()
        time.sleep(0.1)
        arduinoData.open()
        arduinoData.write(bytes([61]))
        while arduinoData.in_waiting < 3:
            time.sleep(0.1)
        time_components['hour'] = int.from_bytes(arduinoData.read(), byteorder='big')
        time_components['minute'] = int.from_bytes(arduinoData.read(), byteorder='big')
        time_components['second'] = int.from_bytes(arduinoData.read(), byteorder='big')
        arduinoData.close()
        return jsonify(time_components), 200
    except Exception as e:
        print('Error in retrieving timer time:', str(e))
        return jsonify({'error': 'An error occurred during retrieving timer time', 'details:': str(e)}), 500
    
@app.route('/timer/save', methods=['POST'])
def save_timer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid data received'}), 400
        
        time_to_save = Time(time_type = "timer", hour = data['user_hour'], minute = data['user_minute'], second = data['user_second'])
        print("Got time:", time_to_save.hour,":",time_to_save.minute,":",time_to_save.second)

        db.session.add(time_to_save)
        db.session.commit()
        return jsonify({'message': 'Timer successfully saved'}), 200
    
    except Exception as e:
        print('Error in saving timer:', str(e))
        return jsonify({'error': 'An error occurred during saving timer', 'details:': str(e)}), 500
    
@app.route('/timer/choose', methods=['GET'])
def choose_timer():
    try:
        timers = Time.query.filter(Time.time_type == "timer").order_by(Time.id.desc()).limit(5).all()
        timers_list = [{"hour": timer.hour, "minute": timer.minute, "second": timer.second} for timer in timers]
        
        return jsonify(timers_list), 200
    except Exception as e:
        print('Error in retrieving timers:', str(e))
        return jsonify({'error': 'An error occurred during retrieving timers', 'details:': str(e)}), 500
    

@app.route('/timer', methods=['GET'])
def choose_timer_mode():
    arduinoData.open()
    arduinoData.write(bytes([4]))
    arduinoData.close()
    return jsonify({'message': 'Timer successfully chosen'}), 200

if __name__ == '__main__':
    ports = list(serial.tools.list_ports.comports())

    if not ports:
        print("No serial ports found")
    else:
        print("Available ports:")
        for port, desc, hwid in ports:
            print(f"{port} ({desc}) - {hwid}")
        print("my port")
        print(arduinoData.name)
    app.secret_key = 'secret key'
    app.config['SESSION_TYPE'] = 'redis'
    app.app_context().push()
    try:
        db.create_all()
    except Exception as e:
        print(e)
    app.run(debug=True)