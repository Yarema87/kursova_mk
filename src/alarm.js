import React, {useState} from "react";
import axios, {isCancel, AxiosError} from "axios";

function Alarm(){
    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("00");
    const [second, setSecond] = useState("00");
    const [alarms, setAlarms] = useState([]);

    const user_time = {
        user_hour: hour,
        user_minute: minute,
        user_second: second
    }

    const saveHour = (e) => {
        if(e.target.value > 23){
            alert("Enter valid hour");
            e.target.value = 0;
        }
        else{
            setHour(e.target.value);
        }
    };

    const saveMinute = (e) => {
        if(e.target.value > 59){
            alert("Enter valid minute");
            e.target.value = 0;
        }
        else{
            setMinute(e.target.value);
        }
    };

    const handleSaveClick = () => {
        const save_url = `http://localhost:5000/alarm/save`;
        axios.post(save_url, user_time)
        .then(response => {
            console.log('Data transfered', response.data);
        })
        .catch(error => {
            console.error('Error during saving:', error);
        });
    };

    const handleSetClick = () => {
        const set_url = `http://localhost:5000/alarm/set`;
        axios.post(set_url, user_time)
        .then(response => {
            console.log('Data transfered', response.data);
        })
        .catch(error => {
            console.error('Error during saving:', error);
        });
    };

    const chooseFromSaved = () => {
        const choose_url = `http://localhost:5000/alarm/choose`;
        axios.get(choose_url)
        .then(response => {
            setAlarms(response.data);
        })
        .catch(error => {
            console.error('Error during getting saved alarms', error);
        });
        if(document.querySelector(".saved-alarms")){
            document.querySelector(".saved-alarms").classList.toggle("hidden");
        }
    };

    const handleAlarmClick = (alarm) => {
        setHour(alarm.hour.toString()); 
        setMinute(alarm.minute.toString());
        document.querySelector(".saved-alarms").classList.add("hidden");
      };
       

    return(
        <span className="main_span">
            <input placeholder="hour" onChange={saveHour} value = {hour === "00" ? "" : hour} type="number"></input>
            <input placeholder="minute" onChange={saveMinute} value={minute === "00" ? "" : minute} type="number"></input>
            <div className="buttons">
                <button onClick={handleSetClick}>Set</button>
                <button onClick={handleSaveClick}>Save</button>
            </div>
            <div className="buttons" id="middle">
                <button onClick={chooseFromSaved}>Choose from saved</button>
            </div>
            {alarms.length > 0 && (
        <div className="saved-alarms">
          <h3>Saved Alarms:</h3>
          <div>
            {alarms.map((alarm, index) => (
                <button className="saved_alarms" onClick={() => handleAlarmClick(alarm)}>
              <li key={index}>
                {alarm.hour}:{alarm.minute}
              </li>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="UTC hidden"></div>
        </span>
    )
}

export default Alarm;